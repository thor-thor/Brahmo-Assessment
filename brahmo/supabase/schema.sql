-- Table 1: Citation extraction patterns
CREATE TABLE citation_patterns (
  id SERIAL PRIMARY KEY,
  pattern_name VARCHAR(50) UNIQUE NOT NULL,
  regex_pattern TEXT NOT NULL,
  format_template VARCHAR(200),
  example VARCHAR(100),
  jurisdiction VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Section mappings (IPC → BNS, CrPC → BNSS, IEA → BSA)
CREATE TABLE section_mappings (
  id SERIAL PRIMARY KEY,
  old_section VARCHAR(50) NOT NULL,
  new_section VARCHAR(50) NOT NULL,
  old_act VARCHAR(100) NOT NULL,
  new_act VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Verification cache (to avoid repeated API calls)
CREATE TABLE verification_cache (
  id SERIAL PRIMARY KEY,
  citation_text VARCHAR(200) UNIQUE NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50), -- VERIFIED, NOT_FOUND, UNVERIFIED
  ik_doc_id INTEGER,
  case_name VARCHAR(300),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Matter templates (8 pre-loaded scenarios for demo)
CREATE TABLE legal_matters (
  id SERIAL PRIMARY KEY,
  matter_name VARCHAR(100),
  practice_area VARCHAR(50),
  court VARCHAR(100),
  description TEXT,
  sample_query TEXT
);