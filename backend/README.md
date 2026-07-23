# Document AI Service

This backend provides a Spring Boot 3 service for uploading supported document files, extracting their textual content, and storing the extracted text plus metadata in PostgreSQL.

## Features
- Upload TXT, JSON, PDF, DOCX, CSV, and XML files
- Automatic text extraction via modular parsers
- Persistence to PostgreSQL with document metadata
- REST endpoints for upload, retrieval, listing, and deletion

## Prerequisites
- Java 21
- Maven
- PostgreSQL running locally on port 5432

## Database setup
Create a database named `document_ai` and a user with the credentials from `application.yml` or adjust the values accordingly.

## Run locally
```bash
mvn spring-boot:run
```

## API endpoints
- POST `/api/documents/upload`
- GET `/api/documents`
- GET `/api/documents/{id}`
- DELETE `/api/documents/{id}`
