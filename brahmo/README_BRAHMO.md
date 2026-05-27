# BRAHMO Citation Safety Engine

**Making AI safe for lawyers by preventing hallucinated citations from reaching court filings.**

## Overview

BRAHMO is a deterministic legal citation verification pipeline that:

✅ **Extracts** citations using database-driven regex patterns
✅ **Pre-filters** impossible citations without API calls
✅ **Verifies** citations against Indian Kanoon database
✅ **Corrects** formatting issues automatically
✅ **Alerts** users to repealed/renumbered legal sections
✅ **Reports** detailed diagnostics with cost analysis

## Key Features

### 1. Intelligent Citation Classification

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ **VERIFIED** | Exact match in Indian Kanoon | Keep as-is |
| ⚠️ **CORRECTED** | Match found after format fix | Show correction |
| ⚠️ **UNVERIFIED** | Format valid but not in IK | Flag for review |
| ❌ **REMOVED** | Impossible or fabricated | Exclude from output |

### 2. Smart Format Corrections

Automatically fixes:
- Missing spaces: `(2023)5SCC123` → `(2023) 5 SCC 123`
- Court abbreviations: `AIR Delhi` → `AIR Del`
- Capitalization: `SCC Online` → `SCC OnLine`

### 3. Section Normalization

Automatically converts repealed sections:
- `Section 420 IPC` → `Section 318 BNS`
- `Section 438 CrPC` → `Section 482 BNSS`
- `Section 65B IEA` → `Section 63 BSA`

### 4. Pre-Filter Protection

Catches impossible citations immediately without API calls:
- **Future dates** (2025 and beyond)
- **Impossible volumes** (SCC > 25)
- **Pre-modern dates** (before 1900)
- **Suspicious patterns** (page numbers > 5000)

### 5. Parallel Verification

Verifies 10+ citations in ~2 seconds using:
- Promise.all() for simultaneous API calls
- In-memory caching for duplicates
- Fallback handling for API failures

## Quick Start

### Installation

```bash
npm install
# or
yarn install
```

### Configuration

Create `.env.local`:
```bash
INDIAN_KANOON_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Running Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Via UI

1. Select a legal matter from the dropdown
2. Enter your legal question or document
3. Click **"Verify Citations"**
4. Review the annotated output with colored badges
5. Check the verification report for details

### Via API

```bash
curl -X POST http://localhost:3000/api/citation-check \
  -H "Content-Type: application/json" \
  -d '{
    "query": "In Siddharth v. State (2021) 10 SCC 1, the Court held...",
    "mode": "verified"
  }'
```

**Response:**
```json
{
  "annotatedText": "<HTML with colored badges>",
  "report": {
    "totalFound": 5,
    "verified": 3,
    "corrected": 1,
    "unverified": 1,
    "removed": 0,
    "accuracy": 80.0,
    "ikApiCalls": 2,
    "cacheHits": 3
  },
  "sectionAlerts": [...],
  "diagnostics": [...]
}
```

## Architecture

```
Input Query
    ↓
[Section Normalizer] - Convert IPC→BNS, CrPC→BNSS
    ↓
[Citation Extractor] - Load patterns from Supabase
    ↓
[Pre-Filter] - Rule-based validation (no API)
    ↓
[Parallel Verification] - Indian Kanoon API + Cache
    ↓
[Annotator] - HTML badge generation
    ↓
[Report Generator] - Metrics & diagnostics
    ↓
Output: Annotated text + Report + Diagnostics
```

## Citation Format Support

| Format | Example | Regex |
|--------|---------|-------|
| **SCC** | (2021) 10 SCC 1 | `\((\d{4})\)\s+(\d{1,2})\s+SCC\s+(\d{1,5})` |
| **SCC OnLine** | 2024 SCC OnLine Del 3456 | `(\d{4})\s+SCC\s+OnLine\s+(SC\|Del\|Bom...)` |
| **AIR** | AIR 2024 SC 123 | `AIR\s+(\d{4})\s+(SC\|Del\|Bom...)` |
| **Cri LJ** | (2024) Cri LJ 789 | `\(?(\d{4})\)?\s+Cri\s+LJ` |
| **SCR** | (2024) 5 SCR 123 | `\((\d{4})\)\s+(\d{1,2})\s+SCR` |
| **MANU** | MANU/SC/2024/1234 | `MANU/(SC\|DE\|MH...)` |

## Pre-Filter Rules

### Rule: FUTURE_YEAR
**Condition:** Year > current year
**Action:** REMOVE (impossible)
**Example:** (2025) 10 SCC 1

### Rule: IMPOSSIBLE_SCC_VOLUME
**Condition:** SCC volume > 25
**Action:** REMOVE (impossible)
**Example:** (2020) 30 SCC 100

### Rule: IMPOSSIBLE_PAGE
**Condition:** Page > 5000
**Action:** FLAG_SUSPICIOUS (verify before removing)
**Example:** (2020) 5 SCC 6789

### Rule: FAKE_SCC_PATTERN
**Condition:** Page > 500 AND volume < 10
**Action:** FLAG_SUSPICIOUS (unlikely combination)
**Example:** (2020) 3 SCC 750

## Accuracy Calculation

```javascript
accuracy = (verified + corrected) / (total - preFilterRemoved) × 100
```

**Important:**
- Pre-filter removals are excluded from denominator
- Unverified citations don't reduce accuracy
- Only truly missing/fabricated reduce accuracy

**Example:**
```
Total citations: 9
Pre-filter removed: 2 (future dates, impossible volumes)
Verified: 5
Corrected: 1
Unverified: 1
Accuracy = (5 + 1) / (9 - 2) × 100 = 85.7%
```

## Cost Analysis

**Per API Call:** ₹0.30

**Savings:**
- Pre-filter saved calls: ₹0.30 each
- Cache hits: ₹0.30 each

**Example:**
```
10 citations total
2 pre-filter removed (save ₹0.60)
3 cache hits (save ₹0.90)
5 new API calls (cost ₹1.50)
─────────────────────────────
Net cost: ₹0.90
Net savings: ₹1.50
```

## Test Scenarios

See [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) for comprehensive testing guide covering:
- ✅ Hallucinated citations
- ✅ Repealed sections
- ✅ Format corrections
- ✅ Mixed statuses

## Database Schema

### citation_patterns
```sql
CREATE TABLE citation_patterns (
  id SERIAL PRIMARY KEY,
  pattern_name VARCHAR(50) UNIQUE NOT NULL,
  regex_pattern TEXT NOT NULL,
  format_template VARCHAR(200),
  example VARCHAR(100),
  jurisdiction VARCHAR(50)
);
```

### section_mappings
```sql
CREATE TABLE section_mappings (
  id SERIAL PRIMARY KEY,
  old_section VARCHAR(50) NOT NULL,
  new_section VARCHAR(50) NOT NULL,
  old_act VARCHAR(100) NOT NULL,
  new_act VARCHAR(100) NOT NULL
);
```

### verification_cache
```sql
CREATE TABLE verification_cache (
  id SERIAL PRIMARY KEY,
  citation_text VARCHAR(200) UNIQUE NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50),
  ik_doc_id INTEGER,
  case_name VARCHAR(300)
);
```

## Data Types

### Citation
```typescript
interface Citation {
  type: string;           // 'SCC', 'AIR', 'SCR', etc.
  text: string;           // Original citation text
  year?: number;
  volume?: number;
  page?: number;
  position: number;       // Character position in text
}
```

### VerificationResult
```typescript
interface VerificationResult {
  citationText: string;
  status: 'VERIFIED' | 'CORRECTED' | 'UNVERIFIED' | 'REMOVED';
  caseName?: string;
  ikDocId?: number;
  originalCitation?: string;      // For CORRECTED
  correctedCitation?: string;     // For CORRECTED
  correctionReason?: string;
  reason?: string;                // For UNVERIFIED/REMOVED
  prefilter?: PrefilterResult;
}
```

### VerificationReport
```typescript
interface VerificationReport {
  totalFound: number;
  verified: number;
  corrected: number;
  unverified: number;
  removed: number;
  preFilterRemoved: number;
  accuracy: number;              // 0-100
  ikApiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  estimatedCost: number;          // ₹
  savedCost: number;              // ₹
}
```

## Performance Metrics

| Operation | Target | Notes |
|-----------|--------|-------|
| Extract citations | < 100ms | Regex on patterns table |
| Pre-filter | < 50ms | Rule-based, no IO |
| Verify (10 citations) | ~2 seconds | Parallel API calls |
| Total pipeline | < 3 seconds | With caching |
| Cache hit rate | > 50% | For repeated documents |

## Troubleshooting

### Issue: Citations not extracting
**Solution:**
- Check `citation_patterns` in Supabase
- Verify regex patterns are valid
- Ensure text encoding is UTF-8

### Issue: Low verification accuracy
**Solution:**
- Review section normalization alerts
- Check if citations are recent/unreported
- Verify Indian Kanoon API connectivity

### Issue: API rate limiting
**Solution:**
- Enable verification caching
- Pre-filter is removing impossible citations
- Consider batch processing

### Issue: High API costs
**Solution:**
- Use caching (reduce redundant calls)
- Pre-filter catches impossible early
- Add more patterns to pre-filter

## Advanced Usage

### Custom Citation Patterns

Add to `citation_patterns` table:
```sql
INSERT INTO citation_patterns 
(pattern_name, regex_pattern, example)
VALUES 
('SCC_OnLine', '(\d{4})\s+SCC\s+OnLine...', '2024 SCC OnLine SC 123');
```

No code changes needed!

### Custom Section Mappings

Add to `section_mappings` table:
```sql
INSERT INTO section_mappings
(old_section, new_section, old_act, new_act)
VALUES
('Section 498A IPC', 'Section 85 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita');
```

### Batch Processing

For large documents:
```javascript
// Process in chunks
const chunks = document.split('\n\n');
for (const chunk of chunks) {
  const result = await verifyCitation(chunk);
}
```

## API Reference

### POST /api/citation-check

Verify citations in legal text.

**Request:**
```json
{
  "query": "Legal text with citations",
  "mode": "verified"
}
```

**Response:**
```json
{
  "annotatedText": "HTML with badges",
  "report": { ... },
  "sectionAlerts": [ ... ],
  "diagnostics": [ ... ]
}
```

### POST /api/normalize-sections

Convert repealed sections to current act.

**Request:**
```json
{
  "text": "Section 420 IPC is repealed"
}
```

**Response:**
```json
{
  "originalText": "...",
  "normalizedText": "Section 318 BNS",
  "alerts": [ ... ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests in TEST_SCENARIOS.md
4. Submit a pull request

## License

© 2024 BRAHMO Citation Safety Engine. All rights reserved.

## Support

For issues or questions:
- 📧 Email: support@brahmo.legal
- 🐛 GitHub Issues: [BRAHMO/issues](https://github.com/brahmo/issues)
- 📚 Documentation: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

---

**Making Indian legal research deterministic and trustworthy for AI-assisted legal work.**
