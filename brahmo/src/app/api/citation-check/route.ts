import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm-client';
import { extractCitations } from '@/lib/pipeline/extract';
import { prefilterCitation } from '@/lib/pipeline/prefilter';
import { verifyCitationsParallel, resetCacheMetrics, getCacheMetrics } from '@/lib/pipeline/verify';
import { normalizeSections } from '@/lib/pipeline/section-normalizer';
import { buildDiagnostics } from '@/lib/pipeline/diagnostics';
import { annotateCitations } from '@/lib/citation-annotator';

export async function POST(request: Request) {
  try {
    const { query, mode } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (mode === 'verified') {
      resetCacheMetrics();

      // Normalize the user query to detect deprecated sections and build alerts.
      const { originalText, normalizedText, alerts: sectionAlerts } = await normalizeSections(query);

      // Generate the verified response text first, then verify citations inside it.
      const llmResponse = await callLLM(normalizedText, 'verified');
      const responseText = llmResponse || '';

      // Extract citations from the generated verified response.
      const citations = await extractCitations(responseText);
      const prefilterResults = citations.map(citation => prefilterCitation(citation));
      const verificationResults = await verifyCitationsParallel(citations, prefilterResults);
      const { annotatedText, report } = annotateCitations(
        responseText,
        citations,
        verificationResults,
        sectionAlerts
      );

      const diagnostics = buildDiagnostics(citations, verificationResults);
      const { hits: cacheHits, misses: cacheMisses } = getCacheMetrics();

      report.ikApiCalls = cacheMisses;
      report.cacheHits = cacheHits;
      report.cacheMisses = cacheMisses;
      report.estimatedCost = cacheMisses * 0.3;
      report.savedCost = report.preFilterRemoved * 0.3;

      return NextResponse.json({
        annotatedText,
        report,
        sectionAlerts,
        diagnostics,
        originalQuery: originalText,
        normalizedQuery: normalizedText,
        citationCount: citations.length,
        llmResponse: responseText
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use mode=verified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in citation-check API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}