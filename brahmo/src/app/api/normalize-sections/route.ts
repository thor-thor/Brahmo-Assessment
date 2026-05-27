import { NextResponse } from 'next/server';
import { normalizeSections } from '@/lib/pipeline/section-normalizer';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const { originalText, normalizedText, alerts } = await normalizeSections(text);
    return NextResponse.json({ originalText, normalizedText, alerts });
  } catch (error) {
    console.error('Error in normalize-sections API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}