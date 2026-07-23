-- Create Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    extracted_text TEXT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL
);

-- Create Questions table
CREATE TABLE IF NOT EXISTS question (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL UNIQUE,
    options_json TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_text ON question(question_text);
CREATE INDEX IF NOT EXISTS idx_uploaded_at ON documents(uploaded_at DESC);
