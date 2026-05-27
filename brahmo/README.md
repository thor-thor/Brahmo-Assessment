# BRAHMO Citation Safety Engine

A deterministic citation verification system that prevents AI-generated hallucinated citations from reaching court filings.

## Overview

This system implements a citation safety pipeline that runs after AI generates a legal response to verify citations and normalize legal sections. It consists of:

1. **Citation Extractor** - Regex scan for 6 Indian legal citation formats
2. **Hallucination Pre-Filter** - Rule-based detection of impossible citations
3. **Citation Verifier** - Indian Kanoon API lookup with caching
4. **Section Normalizer** - Converts old IPC/CrPC/IEA sections to new BNS/BNSS/BSA
5. **Citation Annotator** - Marks citations with verification badges
6. **LLM Integration** - Generic AI vs. Verified AI comparison
7. **Demo UI** - Side-by-side response comparison

## Architecture

```
Lawyer Query
    ↓
Section Normalizer (IPC→BNS conversion)
    ↓
LLM API Call (Generates legal response)
    ↓
Citation Safety Engine:
    ├── Citation Extractor (finds all citations)
    ├── Hallucination Detector (pre-filter impossible ones)
    ├── Citation Verifier (Indian Kanoon API lookup)
    └── Citation Annotator (✅/⚠️/❌ badges + report)
    ↓
Annotated AI Response + Verification Report
```

## Features

- ✅ Zero false negatives in citation extraction
- ⚡ Instant hallucination detection (saves API costs)
- 🔄 Parallel citation verification for performance
- 💾 Verification caching to avoid redundant API calls
- 📊 Clear verification report with accuracy metrics
- 🔁 Section normalizer handles all 30 IPC→BNS mappings
- 🆓 Uses free tier APIs (no paid subscriptions required)

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Git
- Supabase account (free)
- LLM API key (Anthropic/OpenAI/Gemini - free credits available)
- Indian Kanoon API key (free signup available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd brahmo-citation-safety/brahmo
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# LLM API (Anthropic Claude example)
LLM_API_KEY=your_anthropic_api_key_here

# Indian Kanoon API
INDIAN_KANOON_API_KEY=your_indian_kanoon_api_key_here
```

### 3. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the schema.sql file:
   ```bash
   # Copy contents of supabase/schema.sql and paste in SQL Editor
   ```
4. Run the seed.sql file to load all data:
   ```bash
   # Copy contents of supabase/seed.sql and paste in SQL Editor
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Select a legal matter from the dropdown (optional)
2. Enter your legal question in the textarea
3. Click "Ask Generic AI" to see AI response without verification
4. Click "Ask with Citation Verification" to see AI response with citation safety
5. Observe the side-by-side comparison, section alerts, and verification report

## Demo Scenarios

The system is pre-loaded with 8 legal matters including the 4 demo scenarios:

1. **The Hallucinated Citation** - Anticipatory bail research
2. **The Repealed Law Catastrophe** - Cheating complaint drafting
3. **The Impossible Citation** - NDPS Act bail research
4. **The Format Error** - Delhi HC criminal revision
5. Corporate NDA review
6. Shareholders dispute
7. Property dispute
8. Family law

## API Endpoints

- `POST /api/llm` - Generic or verified LLM calls
- `POST /api/citation-check` - Full citation verification pipeline
- `POST /api/normalize-sections` - Section normalization only
- `POST /api/indian-kanoon` - Direct Indian Kanoon API proxy

## Technology Stack

- **Frontend**: React + Next.js + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **LLM API**: Anthropic Claude (configurable to other providers)
- **Verification API**: Indian Kanoon API

## Project Structure

```
brahmo/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── page.tsx          # Main demo page
│   │   └── api/              # API route handlers
│   ├── lib/                  # Core logic libraries
│   │   ├── citation-extractor.ts
│   │   ├── hallucination-detector.ts
│   │   ├── citation-verifier.ts
│   │   ├── section-normalizer.ts
│   │   ├── citation-annotator.ts
│   │   └── types.ts
│   └── components/           # React components
├── supabase/                 # Database schema and seed data
│   ├── schema.sql
│   └── seed.sql
└── public/                   # Static assets
```

## How It Works

### Citation Extraction

The extractor loads 6 regex patterns from the database and scans text for:
- SCC: `(2024) 5 SCC 123`
- SCC OnLine: `2024 SCC OnLine Del 456`
- AIR: `AIR 2024 SC 123`
- Cri LJ: `2024 Cri LJ 789`
- SCR: `(2024) 5 SCR 123`
- MANU: `MANU/SC/0123/2024`

### Hallucination Detection

Instantly flags citations as hallucinated if:
- Year > 2026 (future year)
- SCC volume > 25 (impossible volume)
- Year < 1900 (pre-modern date)
- Page number > 5000 (unusual page)

### Citation Verification

For citations that pass the pre-filter:
1. Checks verification cache first
2. If not cached, calls Indian Kanoon API `/search/` endpoint
3. If found, gets document metadata via `/docmeta/{id}/`
4. Caches the result for future use

### Section Normalization

Loads all 30 section mappings from database and converts:
- IPC sections to BNS equivalents (e.g., 420 IPC → 318 BNS)
- CrPC sections to BNSS equivalents
- IEA sections to BSA equivalents

## Limitations & Assumptions

1. **Indian Kanoon Coverage**: Some real cases may not be in IK - marked as UNVERIFIED, not REMOVED
2. **API Costs**: Each verification costs ~₹0.3 (docmeta endpoint)
3. **Concurrent Users**: Designed for single-user demo; production would need rate limiting
4. **LLM Variability**: Different LLMs may produce different citation formats

## Testing

To test the citation extractor directly:

```typescript
import { extractCitations } from './lib/citation-extractor';

const text = "The Supreme Court in Siddharth v. State of UP (2021) 10 SCC 1 held...";
const citations = await extractCitations(text);
// Returns array of citation objects
```

## Future Improvements

1. **Cost Tracking**: More sophisticated API cost estimation
2. **Expired Citations**: Detect overruled/superseded cases
3. **Multi-Jurisdiction**: Add US/UK citation formats
4. **Enhanced UI**: Better visualization of citation verification
5. **Batch Processing**: Verify multiple queries efficiently
6. **Offline Mode**: Extended caching for disconnected use

## License

MIT

## Acknowledgments

- Inspired by the Mata v. Avianca Airlines case (2023)
- Indian Kanoon API for legal case verification
- Supabase for free PostgreSQL hosting
- Next.js and Tailwind CSS for rapid development