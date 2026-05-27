import { createClient } from '@supabase/supabase-js';

// Pre-loaded seed data for Sandbox Mode
const MOCK_CITATION_PATTERNS = [
  {
    id: 1,
    pattern_name: 'SCC',
    regex_pattern: '\\((\\d{4})\\)\\s+(\\d{1,2})\\s+SCC\\s+(\\d{1,5})',
    format_template: '({year}) {volume} SCC {page}',
    example: '(2024) 5 SCC 123',
    jurisdiction: 'India'
  },
  {
    id: 2,
    pattern_name: 'SCC_OnLine',
    regex_pattern: '(\\d{4})\\s+SCC\\s+(OnLine|Online)\\s+(SC|Del|Bom|Cal|Mad|All|Kar|Ker|Pat|Raj|MP|AP|Guj)\\s+(\\d{1,6})',
    format_template: '{year} SCC OnLine {court} {page}',
    example: '2024 SCC OnLine Del 456',
    jurisdiction: 'India'
  },
  {
    id: 3,
    pattern_name: 'AIR',
    regex_pattern: 'AIR\\s+(\\d{4})\\s+(SC|Delhi|Del|Bom|Cal|Mad|All|Kar|Ker|Pat|Raj|MP|AP|Guj|NOC)\\s+(\\d{1,5})',
    format_template: 'AIR {year} {court} {page}',
    example: 'AIR 2024 SC 123',
    jurisdiction: 'India'
  },
  {
    id: 4,
    pattern_name: 'Cri_LJ',
    regex_pattern: '\\(?(\\d{4})\\)?\\s+Cri\\s+LJ\\s+(\\d{1,5})',
    format_template: '({year}) Cri LJ {page}',
    example: '2024 Cri LJ 789',
    jurisdiction: 'India'
  },
  {
    id: 5,
    pattern_name: 'SCR',
    regex_pattern: '\\((\\d{4})\\)\\s+(\\d{1,2})\\s+SCR\\s+(\\d{1,5})',
    format_template: '({year}) {volume} SCR {page}',
    example: '(2024) 5 SCR 123',
    jurisdiction: 'India'
  },
  {
    id: 6,
    pattern_name: 'MANU',
    regex_pattern: 'MANU/(SC|DE|MH|KA|KE|WB|TN|AP|GJ|RJ|MP|UP)/(\\d{4})/(\\d{4,6})',
    format_template: 'MANU/{court}/{year}/{doc_id}',
    example: 'MANU/SC/0123/2024',
    jurisdiction: 'India'
  }
];

const MOCK_SECTION_MAPPINGS = [
  { old_section: 'Section 302 IPC', new_section: 'Section 101 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 304 IPC', new_section: 'Section 105 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 304A IPC', new_section: 'Section 106 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 304B IPC', new_section: 'Section 80 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 306 IPC', new_section: 'Section 108 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 307 IPC', new_section: 'Section 109 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 323 IPC', new_section: 'Section 115 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 326 IPC', new_section: 'Section 119 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 354 IPC', new_section: 'Section 74 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 376 IPC', new_section: 'Section 63 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 379 IPC', new_section: 'Section 303 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 384 IPC', new_section: 'Section 308 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 392 IPC', new_section: 'Section 309 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 406 IPC', new_section: 'Section 316 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 420 IPC', new_section: 'Section 318 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 467 IPC', new_section: 'Section 336 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 498A IPC', new_section: 'Section 85 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 499 IPC', new_section: 'Section 356 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 506 IPC', new_section: 'Section 351 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 34 IPC', new_section: 'Section 3(5) BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 120B IPC', new_section: 'Section 61 BNS', old_act: 'Indian Penal Code', new_act: 'Bharatiya Nyaya Sanhita' },
  { old_section: 'Section 125 CrPC', new_section: 'Section 144 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 154 CrPC', new_section: 'Section 173 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 156(3) CrPC', new_section: 'Section 175(3) BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 167 CrPC', new_section: 'Section 187 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 437 CrPC', new_section: 'Section 480 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 438 CrPC', new_section: 'Section 482 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 439 CrPC', new_section: 'Section 483 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 482 CrPC', new_section: 'Section 528 BNSS', old_act: 'Code of Criminal Procedure', new_act: 'Bharatiya Nagarik Suraksha Sanhita' },
  { old_section: 'Section 65B IEA', new_section: 'Section 63 BSA', old_act: 'Indian Evidence Act', new_act: 'Bharatiya Sakshya Adhiniyam' }
];

const MOCK_LEGAL_MATTERS = [
  { id: 1, matter_name: 'Rajesh Kumar — Anticipatory Bail', practice_area: 'Criminal', court: 'Delhi High Court', description: 'Anticipatory bail under Section 482 BNSS', sample_query: 'Key SC precedents on anticipatory bail in economic offences' },
  { id: 2, matter_name: 'Criminal Complaint — Cheating Case', practice_area: 'Criminal', court: 'Delhi Metropolitan Magistrate', description: 'Draft complaint for cheating under Section 420 IPC', sample_query: 'Draft a complaint for cheating under Section 420 IPC with criminal breach of trust under Section 406 IPC' },
  { id: 3, matter_name: 'NDPS Act Bail Research', practice_area: 'Criminal', court: 'Supreme Court research', description: 'Summarize SC approach to bail in NDPS cases over last 5 years', sample_query: 'Summarize SC approach to bail in NDPS cases over last 5 years' },
  { id: 4, matter_name: 'Delhi HC Criminal Revision', practice_area: 'Criminal', court: 'Delhi High Court', description: 'Key Delhi HC decisions on Section 482 BNSS powers in last 2 years', sample_query: 'Key Delhi HC decisions on Section 482 BNSS powers in last 2 years' },
  { id: 5, matter_name: 'Corporate NDA Review', practice_area: 'Corporate', court: 'N/A (transactional)', description: 'Review NDA and flag missing clauses for Indian law', sample_query: 'Review NDA and flag missing clauses for Indian law' },
  { id: 6, matter_name: 'Shareholders Dispute', practice_area: 'Corporate', court: 'NCLT Delhi', description: 'Grounds for NCLT petition — oppression and mismanagement', sample_query: 'Grounds for NCLT petition — oppression and mismanagement' },
  { id: 7, matter_name: 'Property Dispute', practice_area: 'Property', court: 'Civil Court Delhi', description: 'Specific performance of immovable property sale agreement', sample_query: 'Specific performance of immovable property sale agreement' },
  { id: 8, matter_name: 'Family Law', practice_area: 'Family', court: 'Family Court Delhi', description: 'Grounds for contested divorce under Hindu Marriage Act Section 13', sample_query: 'Grounds for contested divorce under Hindu Marriage Act Section 13' }
];

// Simple in-memory cache that persists inside the singleton client instance
const MOCK_VERIFICATION_CACHE: any[] = [];

class MockSupabaseQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private dataStore: Record<string, any[]>;

  constructor(table: string, dataStore: Record<string, any[]>) {
    this.table = table;
    this.dataStore = dataStore;
  }

  select(fields?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => {
      const itemVal = item[column];
      if (typeof itemVal === 'string' && typeof value === 'string') {
        return itemVal.toLowerCase() === value.toLowerCase();
      }
      return itemVal === value;
    });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item: any) => {
      const itemVal = item[column];
      if (typeof itemVal === 'string' && Array.isArray(values)) {
        return values.some(v => typeof v === 'string' && itemVal.toLowerCase() === v.toLowerCase());
      }
      return values.includes(itemVal);
    });
    return this;
  }

  single() {
    const items = this.dataStore[this.table] || [];
    const filtered = items.filter(item => this.filters.every(f => f(item)));
    if (filtered.length === 0) {
      return Promise.resolve({ data: null, error: { message: 'No rows found', code: 'PGRST116' } });
    }
    return Promise.resolve({ data: filtered[0], error: null });
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const items = this.dataStore[this.table] || [];
    const ascending = opts?.ascending !== false;
    const sorted = [...items].sort((a, b) => {
      const left = a[column];
      const right = b[column];
      if (left == null && right == null) return 0;
      if (left == null) return ascending ? -1 : 1;
      if (right == null) return ascending ? 1 : -1;
      if (typeof left === 'string' && typeof right === 'string') {
        return ascending ? left.localeCompare(right) : right.localeCompare(left);
      }
      return ascending ? (left > right ? 1 : left < right ? -1 : 0) : (left < right ? 1 : left > right ? -1 : 0);
    });
    return Promise.resolve({ data: sorted.filter(item => this.filters.every(f => f(item))), error: null });
  }

  // To support standard Promise .then() interface
  then(onfulfilled: (value: any) => any) {
    const items = this.dataStore[this.table] || [];
    const filtered = items.filter(item => this.filters.every(f => f(item)));
    return Promise.resolve({ data: filtered, error: null }).then(onfulfilled);
  }
}

class MockSupabaseClient {
  private dataStore: Record<string, any[]> = {
    citation_patterns: MOCK_CITATION_PATTERNS,
    section_mappings: MOCK_SECTION_MAPPINGS,
    legal_matters: MOCK_LEGAL_MATTERS,
    verification_cache: MOCK_VERIFICATION_CACHE
  };

  from(table: string) {
    if (table === 'verification_cache') {
      return {
        select: (fields?: string) => new MockSupabaseQueryBuilder(table, this.dataStore),
        upsert: (data: any) => {
          const arr = this.dataStore[table];
          // We can handle either array of objects or single object
          const itemsToUpsert = Array.isArray(data) ? data : [data];
          
          for (const item of itemsToUpsert) {
            const idx = arr.findIndex((cached: any) => 
              cached.citation_text.toLowerCase() === item.citation_text.toLowerCase()
            );
            if (idx !== -1) {
              arr[idx] = { ...arr[idx], ...item, verified_at: new Date().toISOString() };
            } else {
              arr.push({ ...item, id: arr.length + 1, verified_at: new Date().toISOString() });
            }
          }
          return Promise.resolve({ data, error: null });
        }
      };
    }
    return new MockSupabaseQueryBuilder(table, this.dataStore);
  }
}

// Check environment variables to determine mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isPlaceholder = (str?: string) => {
  if (!str) return true;
  const s = str.toLowerCase();
  return (
    s.includes('your_') ||
    s.includes('your-') ||
    s.includes('placeholder') ||
    s.includes('supabase.co') ||
    s.includes('anon-key')
  );
};

export const isSandboxMode = isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey);

export const supabase = isSandboxMode
  ? (new MockSupabaseClient() as any)
  : createClient(supabaseUrl!, supabaseAnonKey!);
