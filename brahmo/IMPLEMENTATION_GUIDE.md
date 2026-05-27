# BRAHMO Citation Safety Engine - Implementation Guide

## Overview

The BRAHMO Citation Safety Engine is a deterministic legal citation verification pipeline that prevents AI-generated hallucinated citations from reaching court filings.

## Key Features Implemented

### 1. **CORRECTED Citation Workflow** ✅
When a citation format is wrong but the case exists:
- Auto-detect formatting issues (spaces, abbreviations, capitalization)
- Try to find the case with corrected format
- Mark as ⚠️ CORRECTED with original → corrected display
- Store `originalCitation` and `correctedCitation` for audit trail

**Supported Corrections:**
- Missing spaces: `(2023)5SCC123` → `(2023) 5 SCC 123`
- Court abbreviations: `AIR Delhi` → `AIR Del`
- Capitalization: `SCC Online` → `SCC OnLine`
- Multiple corrections combined

### 2. **UNVERIFIED State Handling** ✅
Distinguishes between UNVERIFIED and REMOVED:

**UNVERIFIED** when:
- Citation format is valid
- Pre-filter did NOT fail
- IK API returns found = 0
- Citation may be recent, regional, or unreported

**REMOVED** when:
- Pre-filter caught impossible citation (future date, impossible volume)
- Suspicious pattern flagged AND confirmed by IK
- Clearly fake pattern detected

### 3. **Strike-Through UI for Removed Citations** ✅
```html
<span class="line-through decoration-red-400 opacity-60">
  ❌ Citation text here
</span>
```
- Red color (#DC2626)
- Faded opacity (60%)
- Line-through decoration
- Tooltip showing removal reason

### 4. **Accuracy Calculation** ✅
```javascript
accuracy = (verified + corrected) / (total - preFilterRemoved) × 100
```
- Pre-filter removed citations excluded from denominator
- Unverified citations don't impact accuracy
- Only truly missing/fabricated impact accuracy

**Example:**
- Total: 9 citations
- Pre-filter removed: 2
- Verified: 5
- Corrected: 1
- Accuracy = (5 + 1) / (9 - 2) = 85.7%

### 5. **Complete Section Normalizer** ✅
Automatically converts:
- `Section 420 IPC` → `Section 318 BNS`
- `Section 406 IPC` → `Section 316 BNS`
- `Section 120B IPC` → `Section 61 BNS`
- `Section 34 IPC` → `Section 3(5) BNS`
- `Section 438 CrPC` → `Section 482 BNSS`
- `Section 65B IEA` → `Section 63 BSA`

**Features:**
- Loads mappings from Supabase (not hardcoded)
- Handles singular and plural forms
- Preserves original text for audit trail
- Returns section alerts for user awareness

### 6. **Enhanced Citation Diagnostics** ✅
For each citation, shows:
1. Pre-filter result (REMOVE/FLAG_SUSPICIOUS/PROCEED)
2. Verification attempt (original text)
3. Format corrections applied
4. Final status with explanation
5. Case name and Indian Kanoon ID (if found)

**Expandable/Collapsible:**
- Problematic citations shown expanded
- Verified citations grouped under "N citations verified ✅"
- Click to expand details

### 7. **Database-Driven Pattern System** ✅
All regex patterns loaded dynamically from Supabase:
- `citation_patterns` table
- Patterns: SCC, SCC OnLine, AIR, Cri LJ, SCR, MANU
- NO hardcoded regex in code
- Adding new pattern requires zero code changes
- Fallback to defaults if database unavailable

### 8. **Parallel IK Verification** ✅
- `Promise.all()` for simultaneous API calls
- Caching layer for repeated citations
- Retry handling for failed requests
- Performance target: 10 citations in ~2 seconds

### 9. **Expected Demo Output** ✅
Comprehensive verification report showing:
- 📋 Citation Verification Report
- Total Found / Verified / Corrected / Unverified / Removed
- Accuracy percentage with visual bar
- IK API Calls / Cache Hits / Saved Cost
- Collapsible citation diagnostics

## System Architecture

```
┌─────────────────┐
│   User Query    │
└────────┬────────┘
         │
    ┌────▼────────────────────┐
    │  Section Normalizer     │
    │ IPC/CrPC/IEA → BNS/BNSS │
    └────┬────────────────────┘
         │
    ┌────▼───────────────┐
    │  Citation Extract  │
    │  (DB patterns)     │
    └────┬───────────────┘
         │
    ┌────▼───────────┐
    │   Pre-Filter   │
    │ (Rule-based)   │
    └────┬───────────┘
         │
    ┌────▼──────────────────┐
    │  Parallel Verification│
    │  (Indian Kanoon API)  │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Annotation & Report  │
    │  (HTML badges + JSON) │
    └────┬──────────────────┘
         │
    ┌────▼──────────────┐
    │  Rendered Output  │
    │  with Diagnostics │
    └───────────────────┘
```

## API Endpoints

### POST `/api/citation-check`
**Request:**
```json
{
  "query": "Your legal text with citations here",
  "mode": "verified"
}
```

**Response:**
```json
{
  "annotatedText": "<HTML with badges>",
  "report": {
    "totalFound": 5,
    "verified": 3,
    "corrected": 1,
    "unverified": 1,
    "removed": 0,
    "preFilterRemoved": 0,
    "accuracy": 80.0,
    "ikApiCalls": 2,
    "cacheHits": 3,
    "cacheMisses": 2,
    "estimatedCost": 0.6,
    "savedCost": 1.5
  },
  "sectionAlerts": [...],
  "diagnostics": [...]
}
```

## Data Types

### Citation
```typescript
interface Citation {
  type: string;           // SCC, AIR, SCR, etc.
  text: string;           // Original citation text
  year?: number;          // Extracted year
  volume?: number;        // Extracted volume (if applicable)
  page?: number;          // Extracted page number
  position: number;       // Position in text
}
```

### VerificationResult
```typescript
interface VerificationResult {
  citationText: string;           // Original text
  status: CitationStatus;         // VERIFIED | CORRECTED | UNVERIFIED | REMOVED
  caseName?: string;              // Case title from IK
  ikDocId?: number;               // Indian Kanoon document ID
  reason?: string;                // Explanation for status
  originalCitation?: string;      // For CORRECTED
  correctedCitation?: string;     // For CORRECTED
  correctionReason?: string;      // Why it was corrected
  prefilter?: PrefilterResult;    // Pre-filter details
}
```

## Configuration

### Environment Variables
```bash
INDIAN_KANOON_API_KEY=your_api_key
LLM_API_KEY=your_llm_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Database Schema

#### `citation_patterns`
```sql
CREATE TABLE citation_patterns (
  id SERIAL PRIMARY KEY,
  pattern_name VARCHAR(50) UNIQUE,
  regex_pattern TEXT,
  format_template VARCHAR(200),
  example VARCHAR(100),
  jurisdiction VARCHAR(50)
);
```

#### `section_mappings`
```sql
CREATE TABLE section_mappings (
  id SERIAL PRIMARY KEY,
  old_section VARCHAR(50),
  new_section VARCHAR(50),
  old_act VARCHAR(100),
  new_act VARCHAR(100)
);
```

#### `verification_cache`
```sql
CREATE TABLE verification_cache (
  id SERIAL PRIMARY KEY,
  citation_text VARCHAR(200) UNIQUE,
  verified_at TIMESTAMP,
  status VARCHAR(50),
  ik_doc_id INTEGER,
  case_name VARCHAR(300)
);
```

## Pre-Filter Rules

### REMOVE Actions (No API needed)
1. **FUTURE_YEAR**: Year > current year
2. **IMPOSSIBLE_SCC_VOLUME**: SCC volume > 25
3. **PRE1900_YEAR**: Year < 1900 for SCC/SCR/Cri LJ

### FLAG_SUSPICIOUS Actions (Verification needed)
1. **IMPOSSIBLE_PAGE**: Page > 5000
2. **FAKE_SCC_PATTERN**: Page > 500 for SCC volume < 10
3. **FAKE_AIR_PATTERN**: Page > 500 for AIR

## Citation Format Correction Logic

The system attempts corrections in this order:
1. Try original citation text
2. Apply format corrections (spaces, abbreviations, capitalization)
3. Try format-corrected version
4. For SCC: Try different page numbers (if volume/year match)
5. If all fail and FLAG_SUSPICIOUS: mark as REMOVED
6. Otherwise: mark as UNVERIFIED

## Cost Analysis

**Per API Call:** ₹0.30
**Cache Hit Savings:** ₹0.30 per cached citation
**Pre-Filter Savings:** ₹0.30 × impossible citations caught

**Example Metrics:**
- 10 citations total
- 2 pre-filter removed (save ₹0.60)
- 3 cache hits (save ₹0.90)
- 5 new API calls (cost ₹1.50)
- **Net cost:** ₹0.90

## Testing

Run the test scenarios in `TEST_SCENARIOS.md` to verify:
1. Hallucinated citations are caught
2. Formatting corrections work
3. Section normalization functions
4. Pre-filter rules operate correctly
5. Accuracy calculation is precise
6. Parallel verification completes quickly

## Production Checklist

- [ ] Configure Indian Kanoon API credentials
- [ ] Load citation patterns from Supabase
- [ ] Load section mappings from Supabase
- [ ] Enable verification caching
- [ ] Configure cost tracking
- [ ] Test with sample legal documents
- [ ] Validate accuracy calculations
- [ ] Monitor API performance
- [ ] Set up error logging
- [ ] Configure backup patterns

## Security Considerations

1. API keys stored in environment variables only
2. No citation data persisted without consent
3. Rate limiting on IK API calls
4. Input validation on all queries
5. SQL injection prevention via Supabase parameterization
6. CORS configured appropriately

## Performance Targets

- Citation extraction: < 100ms
- Pre-filtering: < 50ms
- Parallel verification (10 citations): ~2 seconds
- Total pipeline: < 3 seconds
- API cache efficiency: > 50% for repeated queries

## Extensibility

To add support for new citation formats:

1. Add row to `citation_patterns` table:
```sql
INSERT INTO citation_patterns (pattern_name, regex_pattern, example)
VALUES ('NEW_FORMAT', 'YOUR_REGEX', 'EXAMPLE_CITATION');
```

2. Update group extraction logic in `extractCitations()` if needed
3. No code deployment required!

## Troubleshooting

### Citations not extracting
- Check `citation_patterns` table in Supabase
- Verify regex patterns are valid
- Check text encoding (UTF-8)

### Low verification accuracy
- Review section normalization alerts
- Check if citations are recent/unreported
- Verify IK API connectivity

### High API costs
- Enable caching to reduce API calls
- Review pre-filter effectiveness
- Consider batch processing

## References

- Indian Kanoon API: https://api.indiankanoon.org
- BNS (Bharatiya Nyaya Sanhita): https://indiankanoon.org/doc/
- BNSS (Bharatiya Nagarik Suraksha Sanhita)
- BSA (Bharatiya Sakshya Adhiniyam)
