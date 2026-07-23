-- PostgreSQL Schema for Document AI Service
-- This script creates the necessary tables and indexes for the production environment

-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    question_normalized TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(50),
    domain VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_text ON question_bank USING HASH (question_normalized);
CREATE INDEX IF NOT EXISTS idx_domain ON question_bank(domain);
CREATE INDEX IF NOT EXISTS idx_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_created_at ON question_bank(created_at);
CREATE INDEX IF NOT EXISTS idx_updated_at ON question_bank(updated_at);

-- Create document_record table
CREATE TABLE IF NOT EXISTS document_record (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    extracted_text TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_file_name ON document_record(file_name);
CREATE INDEX IF NOT EXISTS idx_document_uploaded_at ON document_record(uploaded_at);

-- Create audit log table (optional, for tracking imports)
CREATE TABLE IF NOT EXISTS import_log (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT,
    total_records INTEGER,
    saved_records INTEGER,
    duplicate_records INTEGER,
    failed_records INTEGER,
    processing_time_ms BIGINT,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    errors TEXT,
    FOREIGN KEY (document_id) REFERENCES document_record(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_log_document_id ON import_log(document_id);
CREATE INDEX IF NOT EXISTS idx_import_log_processed_at ON import_log(processed_at);

-- Add comments for documentation
COMMENT ON TABLE question_bank IS 'Stores all imported questions with normalized text for duplicate detection';
COMMENT ON COLUMN question_bank.question_normalized IS 'Normalized question text used for duplicate detection - spaces, punctuation, and case are normalized';
COMMENT ON COLUMN question_bank.correct_answer IS 'The correct answer in format A, B, C, or D';
COMMENT ON TABLE import_log IS 'Audit trail for all import operations with statistics and error tracking';
