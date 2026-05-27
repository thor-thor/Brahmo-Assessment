import { supabase } from '../supabase';
import { Citation } from './types';

// In-memory cache for citation patterns (loaded once from DB)
let cachedPatterns: Array<{ pattern_name: string; regex_pattern: string; [key: string]: any }> = [];

async function loadCitationPatterns(): Promise<Array<{ pattern_name: string; regex_pattern: string; [key: string]: any }>> {
  if (cachedPatterns.length > 0) {
    return cachedPatterns;
  }

  const { data: patterns, error } = await supabase
    .from('citation_patterns')
    .select('*')
    .order('pattern_name', { ascending: true });

  if (error || !patterns || patterns.length === 0) {
    console.error('Error loading citation patterns from database:', error);
    console.warn('Using fallback default patterns');
    // Fallback patterns if database is unavailable
    cachedPatterns = [
      {
        pattern_name: 'SCC',
        regex_pattern: '\\((\\d{4})\\)\\s+(\\d{1,2})\\s+SCC\\s+(\\d{1,5})'
      },
      {
        pattern_name: 'SCC_OnLine',
        regex_pattern: '(\\d{4})\\s+SCC\\s+(OnLine|Online)\\s+(SC|Delhi|Del|Bom|Cal|Mad|All|Kar|Ker|Pat|Raj|MP|AP|Guj)\\s+(\\d{1,6})'
      },
      {
        pattern_name: 'AIR',
        regex_pattern: 'AIR\\s+(\\d{4})\\s+(SC|Delhi|Del|Bom|Cal|Mad|All|Kar|Ker|Pat|Raj|MP|AP|Guj|NOC)\\s+(\\d{1,5})'
      },
      {
        pattern_name: 'Cri_LJ',
        regex_pattern: '\\(?(\\d{4})\\)?\\s+Cri\\s+LJ\\s+(\\d{1,5})'
      },
      {
        pattern_name: 'SCR',
        regex_pattern: '\\((\\d{4})\\)\\s+(\\d{1,2})\\s+SCR\\s+(\\d{1,5})'
      },
      {
        pattern_name: 'MANU',
        regex_pattern: 'MANU/(SC|DE|MH|KA|KE|WB|TN|AP|GJ|RJ|MP|UP)/\\d{4}/\\d{4,6}'
      }
    ];
  } else {
    cachedPatterns = patterns;
  }

  return cachedPatterns;
}

export async function extractCitations(text: string): Promise<Citation[]> {
  const patterns = await loadCitationPatterns();
  const citations: Citation[] = [];

  const normalizeCitationKey = (citationText: string, type: string) =>
    `${type}:${citationText.trim().replace(/\s+/g, ' ').toLowerCase()}`;

  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.regex_pattern, 'g');
      let match;

      while ((match = regex.exec(text)) !== null) {
        const citation: Citation = {
          type: pattern.pattern_name,
          text: match[0],
          position: match.index
        };

        // Extract groups based on citation type
        switch (pattern.pattern_name) {
          case 'SCC':
            // Group 1: year, Group 2: volume, Group 3: page
            if (match[1]) citation.year = parseInt(match[1], 10);
            if (match[2]) citation.volume = parseInt(match[2], 10);
            if (match[3]) citation.page = parseInt(match[3], 10);
            break;

          case 'SCC_OnLine':
            // Group 1: year, Group 2: OnLine/Online, Group 3: court, Group 4: page
            if (match[1]) citation.year = parseInt(match[1], 10);
            if (match[4]) citation.page = parseInt(match[4], 10);
            break;

          case 'AIR':
            // Group 1: year, Group 2: court, Group 3: page
            if (match[1]) citation.year = parseInt(match[1], 10);
            if (match[3]) citation.page = parseInt(match[3], 10);
            break;

          case 'Cri_LJ':
            // Group 1: year, Group 2: page
            if (match[1]) citation.year = parseInt(match[1], 10);
            if (match[2]) citation.page = parseInt(match[2], 10);
            break;

          case 'SCR':
            // Group 1: year, Group 2: volume, Group 3: page
            if (match[1]) citation.year = parseInt(match[1], 10);
            if (match[2]) citation.volume = parseInt(match[2], 10);
            if (match[3]) citation.page = parseInt(match[3], 10);
            break;

          case 'MANU':
            // Extract year from MANU/SC/2024/123456
            const parts = match[0].split('/');
            if (parts.length >= 4) {
              const possibleYear1 = parseInt(parts[2], 10);
              const possibleYear2 = parseInt(parts[3], 10);
              if (possibleYear1 >= 1900 && possibleYear1 <= 2100) {
                citation.year = possibleYear1;
              } else if (possibleYear2 >= 1900 && possibleYear2 <= 2100) {
                citation.year = possibleYear2;
              }
            }
            break;
        }

        // Check for duplicates (same text at same position)
        const isDuplicate = citations.some(
          c => c.text === citation.text && c.position === citation.position
        );
        
        if (!isDuplicate) {
          citations.push(citation);
        }
      }
    } catch (e) {
      console.error(`Error processing pattern ${pattern.pattern_name}:`, e);
    }
  }

  // Deduplicate citations by normalized text to avoid duplicate counts and repeated verification
  const unique = new Map<string, Citation>();
  for (const citation of citations) {
    const key = normalizeCitationKey(citation.text, citation.type);
    if (!unique.has(key)) {
      unique.set(key, citation);
    }
  }

  return Array.from(unique.values()).sort((a, b) => a.position - b.position);
}