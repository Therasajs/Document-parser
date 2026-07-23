-- PostgreSQL Setup Script
-- Run this script in PostgreSQL to set up the database for the Document AI Service

-- Create database
CREATE DATABASE document_ai;

-- Connect to the new database
\c document_ai

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    extracted_text TEXT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL
);

-- Create questions table
CREATE TABLE IF NOT EXISTS question (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL UNIQUE,
    options_json TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_text ON question(question_text);
CREATE INDEX IF NOT EXISTS idx_uploaded_at ON documents(uploaded_at DESC);

-- Verify tables were created
\dt
