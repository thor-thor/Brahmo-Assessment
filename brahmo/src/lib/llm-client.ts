import { isSandboxMode } from './supabase';

const LLM_API_KEY = process.env.LLM_API_KEY;

function getProvider(): 'anthropic' | 'openai' | 'gemini' | 'simulated' {
  if (!LLM_API_KEY || LLM_API_KEY.includes('your_') || LLM_API_KEY.includes('key_here') || LLM_API_KEY === 'your-anthropic-key') {
    return 'simulated';
  }
  if (LLM_API_KEY.startsWith('sk-ant')) return 'anthropic';
  if (LLM_API_KEY.startsWith('sk-')) return 'openai';
  if (LLM_API_KEY.startsWith('AIzaSy')) return 'gemini';
  return 'simulated';
}

export async function callLLM(query: string, mode: 'generic' | 'verified'): Promise<string> {
  const provider = getProvider();

  if (provider === 'simulated') {
    return getSimulatedResponse(query, mode);
  }

  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${LLM_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }]
          })
        }
      );
      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: query }],
          max_tokens: 1000
        })
      });
      if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LLM_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: query }]
        })
      });
      if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
      const data = await response.json();
      return data.content[0].text;
    }
  } catch (err) {
    console.error('LLM API call failed, falling back to simulator:', err);
  }

  return getSimulatedResponse(query, mode);
}

function getSimulatedResponse(query: string, mode: 'generic' | 'verified'): string {
  const cleanQuery = query.toLowerCase();

  if (cleanQuery.includes('anticipatory bail') || cleanQuery.includes('economic') || cleanQuery.includes('precedents on anticipatory')) {
    return `The Supreme Court has established comprehensive principles for anticipatory bail in economic offences:

In Siddharth v. State of UP (2021) 10 SCC 1, the Court laid down guidelines that anticipatory bail should not be denied merely because the accusation involves economic offences.

In Satender Kumar Antil v. CBI (2022) 10 SCC 51, the Court classified offences into categories for bail purposes.

In Arnesh Kumar v. State of Bihar (2014) 8 SCC 273, the Court issued comprehensive guidelines on arrest, directly relevant to anticipatory bail.

In Sushila Aggarwal v. State (NCT of Delhi) (2020) 5 SCC 1, the Court confirmed that anticipatory bail orders need not be time-limited.

In Rajesh Sharma v. State of UP (2023) 4 SCC 789, the Court held that economic offences alone cannot be ground for denying anticipatory bail.

In Amit Kumar v. Union of India AIR 2024 SC 567, the Court reiterated that personal liberty under Article 21 must be given primacy.

Additionally, in Vikram Singh v. State (2024) 8 SCC 234, the Supreme Court clarified the standard of proof required during anticipatory bail hearings.

In (2028) 3 SCC 45, a future date case was referenced. [Note: Hallucinated - will be removed]

In (2024) 47 SCC 123, an impossible volume case was cited. [Note: Hallucinated - will be removed]`;
  }

  if (cleanQuery.includes('cheating') || cleanQuery.includes('breach of trust') || cleanQuery.includes('420')) {
    if (mode === 'generic') {
      return `COMPLAINT UNDER SECTION 420 IPC AND SECTION 406 IPC

The complainant respectfully submits that the accused has committed offences punishable under Section 420 of the Indian Penal Code (cheating and dishonestly inducing delivery of property) read with Section 120B IPC (criminal conspiracy) and Section 34 IPC (common intention).

The accused, acting in conspiracy, induced the complainant to part with Rs. 50,00,000 under the false pretense of a business partnership.

The complainant prays that an FIR be registered under Sections 420, 406, 120B and 34 of the Indian Penal Code against the accused persons.`;
    } else {
      return `COMPLAINT UNDER SECTION 318 BNS AND SECTION 316 BNS

The complainant respectfully submits that the accused has committed offences punishable under Section 318 of the Bharatiya Nyaya Sanhita (cheating and dishonestly inducing delivery of property) read with Section 61 BNS (criminal conspiracy) and Section 3(5) BNS (common intention).

The accused, acting in conspiracy, induced the complainant to part with Rs. 50,00,000 under the false pretense of a business partnership.

The complainant prays that an FIR be registered under Sections 318, 316, 61 and 3(5) of the Bharatiya Nyaya Sanhita against the accused persons.`;
    }
  }

  if (cleanQuery.includes('ndps') || cleanQuery.includes('impossible')) {
    return `The Supreme Court has maintained a stringent approach to bail under the NDPS Act:

1. In State of Kerala v. Rajesh (2020) 12 SCC 122, the Court reaffirmed that the dual conditions under Section 37 must be satisfied.
2. In Union of India v. Niyazuddin (2018) 13 SCC 738, the compliance with Section 50 was held mandatory.
3. In Union of India v. Shiv Shanker Kesari (2007) 7 SCC 798, the meaning of 'reasonable grounds' was explained.
4. In State of Haryana v. Samarth Kumar (2022) 10 SCC 51, the Court ruled on bail based on statements of co-accused.
5. In recent rulings like (2028) 3 SCC 45 and (2024) 47 SCC 123, the Court has relaxed bail for intermediate quantities.
6. Also, in (2023) 19 SCC 456, the Court discussed the admissibility of WhatsApp chats.`;
  }

  if (cleanQuery.includes('revision') || cleanQuery.includes('482 bnss') || cleanQuery.includes('delhi hc')) {
    return `The Delhi High Court's exercise of powers under Section 482 BNSS has evolved:

1. In 2024 SCC Online Del 3456, the Court held that revision petitions against summoning orders are maintainable.
2. In Amit Kumar v. Union AIR 2024 Delhi 234, the court quashed proceedings where the dispute was civil in nature.
3. In State v. Ram Singh (2023) 5 SCC123, the Court discussed limits of inherent powers.
4. In Siddharth v. State of UP (2021) 10 SCC 1, the arrest guidelines were applied.
5. In Satender Kumar Antil v. CBI (2022) 10 SCC 51, bail guidelines were discussed.
6. The High Court in 2024 SCC OnLine Del 3456 verified that the application of BNSS is prospective.`;
  }

  if (cleanQuery.includes('nda') || cleanQuery.includes('corporate nda')) {
    return `Review of the Non-Disclosure Agreement (NDA) under Indian law:

The agreement lacks standard protection clauses under the Indian Contract Act, 1872.

1. **Remedies for Breach**: The clause should reference injunction reliefs under the Specific Relief Act, 1963. Refer to (2021) 5 SCC 123 for specific performance standards.
2. **Admissibility of Digital Signatures**: Under Section 65B IEA, electronic records must be certified.
3. **Dispute Resolution**: Arb-Med clauses are recommended per (2022) 10 SCC 51.`;
  }

  const hasIeaRef = cleanQuery.includes('iea') || cleanQuery.includes('evidence');
  const hasCrpcRef = cleanQuery.includes('crpc') || cleanQuery.includes('procedure');
  const hasIpcRef = cleanQuery.includes('ipc') || cleanQuery.includes('penal') || cleanQuery.includes('rera') || cleanQuery.includes('property');

  let responseText = `LEGAL OPINION & PRECEDENTS:

Based on the research query regarding "${query}":

The Supreme Court has clarified the legal position in a series of judgments:

1. **Primary Precedent**: In Devendra Kumar v. State of Maharashtra (2021) 10 SCC 1, the Court held that property disputes must be resolved in accordance with statutory guidelines.
2. **Procedural Requirements**: Compliance with statutory conditions is mandatory as held in (2022) 10 SCC 51.
3. **Suspicious Reference**: In (2028) 5 SCC 99, a future date is mentioned.
4. **Volume Reference**: In (2024) 38 SCC 20, an impossible volume is referenced.
5. **Formatting Issue**: Under 2024 SCC Online Del 3456, the court allowed revision.`;

  if (hasIeaRef) {
    responseText += `\n\n6. **Evidence Admissibility**: Digital evidence must comply with requirements of Section 65B IEA.`;
  } else if (hasCrpcRef) {
    responseText += `\n\n6. **Procedural Actions**: Applications under Section 125 CrPC and Section 482 CrPC.`;
  } else if (hasIpcRef || cleanQuery.includes('property') || cleanQuery.includes('rera')) {
    responseText += `\n\n6. **Offence Profiling**: Cheating under Section 420 IPC, conspiracy under Section 120B IPC.`;
  } else {
    responseText += `\n\n6. **Digital Records Verification**: Contracts must satisfy Section 65B IEA requirements.`;
  }

  return responseText;
}