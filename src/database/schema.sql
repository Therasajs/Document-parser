-- Question Bank Table
CREATE TABLE IF NOT EXISTS question_bank (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  question_normalized VARCHAR(5000) NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty VARCHAR(50),
  domain VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_normalized ON question_bank USING HASH (question_normalized);
CREATE INDEX IF NOT EXISTS idx_domain ON question_bank (domain);
CREATE INDEX IF NOT EXISTS idx_difficulty ON question_bank (difficulty);
CREATE INDEX IF NOT EXISTS idx_created_at ON question_bank (created_at);
CREATE INDEX IF NOT EXISTS idx_updated_at ON question_bank (updated_at);

-- Document Records Table
CREATE TABLE IF NOT EXISTS document_records (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255),
  file_size BIGINT,
  file_type VARCHAR(10),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  upload_user VARCHAR(255)
);

-- Import Logs Table
CREATE TABLE IF NOT EXISTS import_logs (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES document_records(id),
  total_records INTEGER,
  saved_records INTEGER,
  duplicate_records INTEGER,
  failed_records INTEGER,
  processing_time_ms BIGINT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  errors TEXT,
  status VARCHAR(20)
);

-- Create index for import logs
CREATE INDEX IF NOT EXISTS idx_import_document_id ON import_logs (document_id);
