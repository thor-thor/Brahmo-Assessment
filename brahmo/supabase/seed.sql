-- Insert citation patterns
INSERT INTO citation_patterns (pattern_name, regex_pattern, format_template, example, jurisdiction) VALUES
('SCC', '\\((\\d{4})\\)\\s+(\\d{1,2})\\s+SCC\\s+(\\d{1,5})', '({year}) {volume} SCC {page}', '(2024) 5 SCC 123', 'India'),
('SCC_OnLine', '(\\d{4})\\s+SCC\\s+OnLine\\s+(SC|Del|Bom|Cal|Mad|All|Kar|Ker|Pat|Raj|MP|AP|Guj)\\s+(\\d{1,6})', '{year} SCC OnLine {court} {page}', '2024 SCC OnLine Del 456', 'India'),
('AIR', 'AIR\\s+(\\d{4})\\s+(SC|Del|Bom|Cal|Mad|All|Kar|Ker|Pat|Raj|MP|AP|Guj|NOC)\\s+(\\d{1,5})', 'AIR {year} {court} {page}', 'AIR 2024 SC 123', 'India'),
('Cri_LJ', '\\(?(\\d{4})\\)?\\s+Cri\\s+LJ\\s+(\\d{1,5})', '({year}) Cri LJ {page}', '2024 Cri LJ 789', 'India'),
('SCR', '\\((\\d{4})\\)\\s+(\\d{1,2})\\s+SCR\\s+(\\d{1,5})', '({year}) {volume} SCR {page}', '(2024) 5 SCR 123', 'India'),
('MANU', 'MANU/(SC|DE|MH|KA|KE|WB|TN|AP|GJ|RJ|MP|UP)/\\d{4}/\\d{4,6}', 'MANU/{court}/{year}/{doc_id}', 'MANU/SC/0123/2024', 'India');

-- Insert section mappings (IPC → BNS, CrPC → BNSS, IEA → BSA)
-- IPC → BNS mappings
INSERT INTO section_mappings (old_section, new_section, old_act, new_act) VALUES
('Section 302 IPC', 'Section 101 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 304 IPC', 'Section 105 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 304A IPC', 'Section 106 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 304B IPC', 'Section 80 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 306 IPC', 'Section 108 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 307 IPC', 'Section 109 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 323 IPC', 'Section 115 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 326 IPC', 'Section 119 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 354 IPC', 'Section 74 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 376 IPC', 'Section 63 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 379 IPC', 'Section 303 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 384 IPC', 'Section 308 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 392 IPC', 'Section 309 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 406 IPC', 'Section 316 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 420 IPC', 'Section 318 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 467 IPC', 'Section 336 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 498A IPC', 'Section 85 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 499 IPC', 'Section 356 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 506 IPC', 'Section 351 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 34 IPC', 'Section 3(5) BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita'),
('Section 120B IPC', 'Section 61 BNS', 'Indian Penal Code', 'Bharatiya Nyaya Sanhita');

-- CrPC → BNSS mappings
INSERT INTO section_mappings (old_section, new_section, old_act, new_act) VALUES
('Section 125 CrPC', 'Section 144 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 154 CrPC', 'Section 173 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 156(3) CrPC', 'Section 175(3) BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 167 CrPC', 'Section 187 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 437 CrPC', 'Section 480 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 438 CrPC', 'Section 482 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 439 CrPC', 'Section 483 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita'),
('Section 482 CrPC', 'Section 528 BNSS', 'Code of Criminal Procedure', 'Bharatiya Nagarik Suraksha Sanhita');

-- IEA → BSA mappings
INSERT INTO section_mappings (old_section, new_section, old_act, new_act) VALUES
('Section 65B IEA', 'Section 63 BSA', 'Indian Evidence Act', 'Bharatiya Sakshya Adhiniyam');

-- Insert legal matters
INSERT INTO legal_matters (matter_name, practice_area, court, description, sample_query) VALUES
('Rajesh Kumar — Anticipatory Bail', 'Criminal', 'Delhi High Court', 'Anticipatory bail under Section 482 BNSS', 'Key SC precedents on anticipatory bail in economic offences'),
('Criminal Complaint — Cheating Case', 'Criminal', 'Delhi Metropolitan Magistrate', 'Draft complaint for cheating under Section 420 IPC', 'Draft a complaint for cheating under Section 420 IPC with criminal breach of trust under Section 406 IPC'),
('NDPS Act Bail Research', 'Criminal', 'Supreme Court research', 'Summarize SC approach to bail in NDPS cases over last 5 years', 'Summarize SC approach to bail in NDPS cases over last 5 years'),
('Delhi HC Criminal Revision', 'Criminal', 'Delhi High Court', 'Key Delhi HC decisions on Section 482 BNSS powers in last 2 years', 'Key Delhi HC decisions on Section 482 BNSS powers in last 2 years'),
('Corporate NDA Review', 'Corporate', 'N/A (transactional)', 'Review NDA and flag missing clauses for Indian law', 'Review NDA and flag missing clauses for Indian law'),
('Shareholders Dispute', 'Corporate', 'NCLT Delhi', 'Grounds for NCLT petition — oppression and mismanagement', 'Grounds for NCLT petition — oppression and mismanagement'),
('Property Dispute', 'Property', 'Civil Court Delhi', 'Specific performance of immovable property sale agreement', 'Specific performance of immovable property sale agreement'),
('Family Law', 'Family', 'Family Court Delhi', 'Grounds for contested divorce under Hindu Marriage Act Section 13', 'Grounds for contested divorce under Hindu Marriage Act Section 13');