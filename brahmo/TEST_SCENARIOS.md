# BRAHMO Citation Safety Engine - Test Scenarios

This document describes the test scenarios for validating the citation safety system.

## Scenario 1: Hallucinated Citations

**Input:**
```
The Supreme Court has laid down comprehensive principles for anticipatory bail in economic offences:

In Siddharth v. State of UP (2021) 10 SCC 1, the Court established clear guidelines.
In Rajesh Sharma v. State of UP (2023) 4 SCC 789, the Court held new principles.
In Fake Case v. State (2020) 15 SCC 500, the fabricated case is cited here.
```

**Expected Output:**
- ✅ VERIFIED: (2021) 10 SCC 1
- ⚠️ UNVERIFIED: (2023) 4 SCC 789 (not in IK database)
- ❌ REMOVED: (2020) 15 SCC 500 (impossible volume > 25)

**Accuracy:** (1 verified + 0 corrected) / (3 - 1) = 50%

---

## Scenario 2: Repealed IPC Sections

**Input:**
```
The charging should be under Section 420 IPC for fraudulent misrepresentation.
Additionally, Section 406 IPC covers criminal breach of trust.
For conspiracy, Section 34 IPC is commonly used.
```

**Expected Output:**
- Section 420 IPC → Section 318 BNS
- Section 406 IPC → Section 316 BNS
- Section 34 IPC → Section 3(5) BNS

**Section Alerts Panel:**
Shows all three conversions with old→new mappings

---

## Scenario 3: Formatting Corrections

**Input:**
```
In Sushila Aggarwal v. State (2020)5SCC1, the decision was clear.
The AIR 2024 Delhi 234 judgment followed the same principle.
The 2024 SCC Online Del 3456 case confirmed this approach.
```

**Expected Output:**
- ⚠️ CORRECTED: (2020) 5 SCC 1 (spacing fixed)
- ⚠️ CORRECTED: AIR 2024 Del 234 (Delhi→Del abbreviation)
- ⚠️ CORRECTED: 2024 SCC OnLine Del 3456 (Online→OnLine capitalization)

**Accuracy:** (0 verified + 3 corrected) / 3 = 100%

---

## Scenario 4: Mixed Citation Status

**Input:**
```
The landmark case Siddharth v. State (2021) 10 SCC 1 established principles.
The controversial Rajesh Sharma v. State (2023) 4 SCC 789 is unverified.
The impossible case Fraud v. State (2025) 30 SCC 100 was caught by prefilter.
The corrected case Sushila Aggarwal v. State (2020)5SCC1 needs formatting.
The fabricated case Fake v. State (2020) 15 SCC 500 is removed.
```

**Expected Output:**
- ✅ VERIFIED: (2021) 10 SCC 1
- ⚠️ UNVERIFIED: (2023) 4 SCC 789
- ❌ REMOVED (Pre-filter): (2025) 30 SCC 100 [FUTURE_YEAR]
- ⚠️ CORRECTED: (2020) 5 SCC 1
- ❌ REMOVED (Pre-filter): (2020) 15 SCC 500 [IMPOSSIBLE_SCC_VOLUME]

**Accuracy Calculation:**
- Total Found: 5
- Pre-Filter Removed: 2
- Verified: 1
- Corrected: 1
- Unverified: 1
- Removed: 0 (pre-filter don't count as removed in final)
- Accuracy = (1 + 1) / (5 - 2) × 100 = 66.7%

---

## Pre-Filter Rules

### REMOVE (Impossible citations - no API call needed)
1. **FUTURE_YEAR**: Year > current year
2. **IMPOSSIBLE_SCC_VOLUME**: SCC volume > 25
3. **PRE1900_YEAR**: Year < 1900 for SCC/SCR/Cri LJ/SCC OnLine

### FLAG_SUSPICIOUS (May be fabricated - needs verification)
1. **IMPOSSIBLE_PAGE**: Page number > 5000
2. **FAKE_SCC_PATTERN**: High page number (>500) for low volume (<10) SCC
3. **FAKE_AIR_PATTERN**: Unusually high page number (>500) for AIR

### PROCEED
- Citation passes format validation

---

## Citation Status Definitions

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ VERIFIED | Found exact match in Indian Kanoon | Keep as-is |
| ⚠️ CORRECTED | Found match after format correction | Show correction with reason |
| ⚠️ UNVERIFIED | Format valid but not in IK database | Keep with warning |
| ❌ REMOVED | Impossible, fabricated, or flagged | Exclude from output |

---

## Format Corrections Supported

1. **Missing spaces**: (2023)5SCC123 → (2023) 5 SCC 123
2. **Court abbreviations**: AIR Delhi → AIR Del
3. **OnLine capitalization**: SCC Online → SCC OnLine
4. **Multiple corrections**: Can combine several fixes

---

## Accuracy Formula

```
Accuracy = (Verified + Corrected) / (Total - PreFilterRemoved) × 100
```

**Important Notes:**
- Pre-filter removed citations are excluded from denominator
- Unverified citations DON'T decrease accuracy
- Only truly missing citations (REMOVED) impact accuracy

---

## Cost Optimization

- **Pre-filter savings**: Each impossible citation avoided = ₹0.30 saved
- **Cache hits**: Repeated citations use cached results (no API cost)
- **Parallel verification**: All citations verified simultaneously

**Example:**
- 10 citations found
- 2 pre-filter removed (save ₹0.60)
- 5 cache hits (save ₹1.50)
- 3 new API calls (cost ₹0.90)
- **Net savings**: ₹1.20

---

## Expected UI Badges

```html
<!-- VERIFIED -->
<span class="citation-badge verified bg-emerald-50 text-emerald-700 border-emerald-200">
  ✅ (2021) 10 SCC 1
</span>

<!-- CORRECTED -->
<span class="citation-badge corrected bg-amber-50 text-amber-700 border-amber-200">
  <span class="line-through">(2020)5SCC1</span> → (2020) 5 SCC 1
</span>

<!-- UNVERIFIED -->
<span class="citation-badge unverified bg-gray-50 text-gray-700 border-gray-200">
  ⚠️ (2023) 4 SCC 789
</span>

<!-- REMOVED -->
<span class="citation-badge removed bg-red-50 text-red-700 border-red-200 line-through decoration-red-400 opacity-60">
  ❌ (2025) 30 SCC 100
</span>
```

---

## Section Normalization Examples

| Old Format | New Format | Act | Reason |
|-----------|-----------|-----|--------|
| Section 420 IPC | Section 318 BNS | Bharatiya Nyaya Sanhita | Criminal fraud section |
| Section 406 IPC | Section 316 BNS | Bharatiya Nyaya Sanhita | Criminal breach of trust |
| Section 120B IPC | Section 61 BNS | Bharatiya Nyaya Sanhita | Conspiracy |
| Section 34 IPC | Section 3(5) BNS | Bharatiya Nyaya Sanhita | Common intention |
| Section 438 CrPC | Section 482 BNSS | Bharatiya Nagarik Suraksha Sanhita | Anticipatory bail |
| Section 65B IEA | Section 63 BSA | Bharatiya Sakshya Adhiniyam | Digital evidence |

---

## Verification Report

The system generates a detailed report showing:

```json
{
  "totalFound": 5,
  "verified": 1,
  "corrected": 1,
  "unverified": 1,
  "removed": 2,
  "preFilterRemoved": 2,
  "accuracy": 66.7,
  "ikApiCalls": 1,
  "cacheHits": 0,
  "cacheMisses": 1,
  "estimatedCost": 0.3,
  "savedCost": 0.6
}
```

---

## System Architecture

1. **Extraction**: Regex patterns loaded from Supabase
2. **Prefilter**: Rule-based validation (no API calls)
3. **Normalization**: Section mapping lookup
4. **Verification**: Parallel Indian Kanoon API calls
5. **Annotation**: HTML badge generation
6. **Reporting**: Metrics and diagnostics
