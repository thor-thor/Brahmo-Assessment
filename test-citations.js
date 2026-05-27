import { verifyCitation } from './src/lib/citation-verifier';
import { Citation } from './src/lib/types';

// Mock the supabase and isSandboxMode for testing
// We'll rely on the existing supabase.ts which already checks for placeholder credentials.

async function testCitation(citationText: string, type: string, year: number, volume?: number, page?: number) {
  const citation: Citation = {
    type,
    text: citationText,
    year,
    volume,
    page,
    position: 0 // position doesn't matter for this test
  };

  const result = await verifyCitation(citation);
  return result;
}

async function runTests() {
  console.log('Testing hallucinated citations...');

  // Test 1: (2023) 4 SCC 789
  const result1 = await testCitation('(2023) 4 SCC 789', 'SCC', 2023, 4, 789);
  console.log('Result for (2023) 4 SCC 789:', result1);

  // Test 2: AIR 2024 SC 567
  const result2 = await testCitation('AIR 2024 SC 567', 'AIR', 2024, undefined, 567);
  console.log('Result for AIR 2024 SC 567:', result2);

  // Test 3: A correct citation that should be verified
  const result3 = await testCitation('(2021) 10 SCC 1', 'SCC', 2021, 10, 1);
  console.log('Result for (2021) 10 SCC 1:', result3);

  // Test 4: A citation that needs correction (page)
  const result4 = await testCitation('(2020) 5 SCC 12', 'SCC', 2020, 5, 12);
  console.log('Result for (2020) 5 SCC 12:', result4);
}

runTests().catch(console.error);