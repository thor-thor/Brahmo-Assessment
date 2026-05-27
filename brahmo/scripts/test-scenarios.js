// scripts/test-scenarios.js
// Node.js script to test all 4 demo scenarios + 1 surprise scenario for Citation Safety Engine
// Usage: node scripts/test-scenarios.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const scenarios = [
  {
    name: 'Scenario 1: Hallucinated Citation',
    query: `What are the key Supreme Court precedents on anticipatory bail in economic offences?`,
    mode: 'verified',
    description: 'Should catch 2 hallucinated, 1 corrected, 4 verified.'
  },
  {
    name: 'Scenario 2: Repealed Law Catastrophe',
    query: `Draft a complaint for cheating under Section 420 IPC with criminal breach of trust under Section 406 IPC`,
    mode: 'verified',
    description: 'Should convert all old IPC sections to BNS.'
  },
  {
    name: 'Scenario 3: Impossible Citation',
    query: `Summarize SC approach to bail in NDPS cases over last 5 years`,
    mode: 'verified',
    description: 'Should pre-filter future year and impossible volume.'
  },
  {
    name: 'Scenario 4: Format Error',
    query: `Key Delhi HC decisions on Section 482 BNSS powers in last 2 years`,
    mode: 'verified',
    description: 'Should correct citation formatting errors.'
  },
  {
    name: 'Surprise Scenario: Property Law',
    query: `What are the leading Supreme Court decisions on specific performance of property sale agreements?`,
    mode: 'verified',
    description: 'Should extract and verify all property law citations.'
  }
];

const API_URL = 'http://localhost:3000/api/citation-check';

async function runScenario(scenario) {
  console.log(`\n=== ${scenario.name} ===`);
  console.log(`Query: ${scenario.query}`);
  console.log(`Description: ${scenario.description}`);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: scenario.query, mode: scenario.mode })
  });
  const data = await res.json();
  if (data.error) {
    console.error('Error:', data.error);
    return;
  }
  // Print summary report if available
  if (data.report) {
    console.log('Verification Report:', data.report);
  }
  if (data.sectionAlerts && data.sectionAlerts.length > 0) {
    console.log('Section Alerts:', data.sectionAlerts);
  }
  if (data.annotatedText) {
    console.log('Annotated Output:');
    console.log(data.annotatedText);
  }
}

(async () => {
  for (const scenario of scenarios) {
    await runScenario(scenario);
  }
})();