# BRAHMO Citation Safety Engine

A deterministic legal citation verification system built with Next.js, TypeScript, and Supabase.

## Overview

This project is designed to detect, correct, and verify Indian legal citations in AI-generated text using:

- Regex-driven citation extraction
- Rule-based prefiltering for hallucinated citations
- Citation correction for formatting and common abbreviation issues
- Indian Kanoon verification and caching
- Strict separation of VERIFIED, CORRECTED, UNVERIFIED, and REMOVED states
- Clean final rendering that removes hallucinated citations and broken sentences
- Section normalization for IPC → BNS and CrPC → BNSS mappings

## Key Features

- Side-by-side generic AI vs verified AI response comparison
- Deterministic citation verification pipeline (no LLM reasoning for citation truth)
- Database-driven citation patterns and section mappings
- Detailed diagnostics panel with status-specific reasoning
- Cost and cache savings tracking for IK API calls

## Local Setup

1. Install dependencies:

```bash
cd "c:\Users\rajes\OneDrive\Desktop\New folder\brahmo"
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open the app in your browser:

- `http://localhost:3000`

## GitHub Deployment

To push this repository to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/brahmo.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Notes

- If you are using sandbox mode, set environment variables for Supabase and the Indian Kanoon API as needed.
- The project currently uses an internal mock mode when `NEXT_PUBLIC_SUPABASE_URL` or `LLM_API_KEY` are missing or placeholders.

## Project Structure

- `src/app` — Next.js App Router pages and API routes
- `src/components` — UI components for the citation verification interface
- `src/lib` — core pipeline logic, verification helpers, and Supabase client
- `supabase` — database schema and seed data for citation patterns and section mappings

## Verification Workflow

1. Generate AI response
2. Extract citations from raw output only
3. Normalize and prefilter citations
4. Correct citations deterministically
5. Verify against Indian Kanoon and cache results
6. Annotate verified/corrected/unverified citations
7. Remove hallucinated citations from the final memo
