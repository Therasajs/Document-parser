# Document AI Service - Setup Guide

This guide will help you set up the PostgreSQL database and run the application.

## Prerequisites

- Java 21 or higher
- Maven 3.8+
- PostgreSQL 12+
- Node.js 16+ (for frontend)

## PostgreSQL Setup

### Step 1: Install PostgreSQL

If you haven't installed PostgreSQL, download it from [postgresql.org](https://www.postgresql.org/download/)

### Step 2: Create Database and User

Open PostgreSQL command line (psql) and run:

```sql
-- Create database
CREATE DATABASE document_ai;

-- Create user (if needed)
CREATE USER postgres WITH PASSWORD 'postgres';

-- Grant privileges
ALTER ROLE postgres WITH SUPERUSER;
ALTER ROLE postgres WITH CREATEDB;
ALTER ROLE postgres WITH CREATEROLE;
```

Or run the provided setup script:
```bash
psql -U postgres -f backend/src/main/resources/setup-postgresql.sql
```

### Step 3: Verify Database Connection

```bash
psql -U postgres -d document_ai
```

If connected successfully, you should see:
```
document_ai=#
```

## Environment Configuration

The application reads configuration from `.env` file. A `.env` file has been created with the following defaults:

```env
DB_URL=jdbc:postgresql://localhost:5432/document_ai
DB_USERNAME=postgres
DB_PASSWORD=postgres
DDL_AUTO=create-drop
SHOW_SQL=false
```

**Modify these values if your PostgreSQL setup is different.**

## Running the Application

### Step 1: Build the Backend

```bash
cd backend
mvn clean install
```

### Step 2: Run the Backend

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Step 3: Run the Frontend (in another terminal)

```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Application Features

- **Drag & Drop Upload**: Drag a file onto the interface to upload
- **Supported Formats**: TXT, JSON, PDF, DOCX, CSV, XML
- **Automatic Parsing**: Backend automatically extracts text and parses data
- **Database Storage**: Extracted data is streamed and stored in PostgreSQL
- **JPA/Hibernate**: Uses Spring Data JPA for database operations

## File Upload Flow

1. User drags and drops a file on the frontend
2. Frontend sends file to `/api/documents/upload` endpoint
3. Backend:
   - Saves document record to PostgreSQL
   - Extracts text from file
   - Parses structured data (questions, options, answers)
   - Streams data to PostgreSQL using JPA
4. Frontend displays import summary with success/failure counts

## Database Schema

### documents table
```
- id: SERIAL PRIMARY KEY
- file_name: VARCHAR(255)
- file_type: VARCHAR(100)
- file_size: BIGINT
- extracted_text: TEXT
- uploaded_at: TIMESTAMP
```

### question table
```
- id: SERIAL PRIMARY KEY
- question_text: TEXT UNIQUE
- options_json: TEXT
- correct_answer: VARCHAR(255)
- created_at: TIMESTAMP
```

## Troubleshooting

### PostgreSQL Connection Error

**Error**: `Connection refused to host: localhost:5432`

**Solution**:
1. Verify PostgreSQL is running
2. Check the `DB_URL` in `.env` file
3. Verify PostgreSQL port (default: 5432)
4. Check PostgreSQL logs

### Database Does Not Exist

**Error**: `ERROR: database "document_ai" does not exist`

**Solution**:
```bash
psql -U postgres -c "CREATE DATABASE document_ai;"
```

### Port Already in Use

**Error**: `Bind exception: Address already in use`

**Solution**: Change the port in `application.yml`:
```yaml
server:
  port: 8081  # Change to another port
```

### Maven Build Fails

**Solution**:
```bash
mvn clean install -X  # Run with debug output
mvn dependency:resolve  # Resolve dependencies
```

## API Endpoints

### Upload Document
- **POST** `/api/documents/upload`
- **Params**: `file` (multipart)
- **Response**: Document metadata + import summary

### List Documents
- **GET** `/api/documents`
- **Response**: Array of documents

### Get Document
- **GET** `/api/documents/{id}`
- **Response**: Single document with extracted text

### Preview File (before import)
- **POST** `/api/documents/preview`
- **Params**: `file` (multipart)
- **Response**: Parsed preview of file content

### Import Data
- **POST** `/api/documents/import`
- **Params**: `file` (multipart)
- **Response**: Import summary (total, saved, errors)

### Delete Document
- **DELETE** `/api/documents/{id}`
- **Response**: 204 No Content

## Performance Tuning

The application uses:
- **Connection Pooling**: HikariCP with max 10 connections
- **Batch Processing**: Hibernate batch size 20
- **Query Optimization**: Indexes on frequently queried columns
- **Transaction Management**: @Transactional for data consistency

## Development Notes

- **DDL Auto**: Set to `create-drop` for development (creates tables on startup, drops on shutdown)
- **Change to `update`** for production (updates schema without dropping data)
- **Hibernate Dialect**: PostgreSQLDialect for optimal PostgreSQL integration
- **Streaming**: Uses Spring WebFlux for efficient large file handling

## Next Steps

1. Start PostgreSQL service
2. Create the database
3. Update `.env` if needed
4. Run backend with `mvn spring-boot:run`
5. Run frontend with `npm run dev`
6. Open `http://localhost:5173` in browser
7. Drag and drop a file to test!

## Support

For issues or questions:
1. Check the logs in the console
2. Verify PostgreSQL connection
3. Ensure all dependencies are installed
4. Check `.env` file configuration
