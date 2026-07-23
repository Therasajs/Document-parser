# Full-Stack Document AI Upload App

A modern full-stack application for uploading, parsing, and storing documents with AI capabilities. Built with React + Vite + Tailwind on the frontend and Spring Boot 3 + Java 21 on the backend.

## ✨ Features

- **Drag & Drop Interface**: Modern, intuitive file upload experience
- **Multi-Format Support**: TXT, JSON, PDF, DOCX, CSV, XML
- **Automatic Text Extraction**: Extracts and processes text from documents
- **Smart Data Parsing**: Parses structured data (questions, options, answers)
- **PostgreSQL Storage**: Efficiently stores data using JPA/Hibernate
- **Streaming Support**: Handles large files with streaming data to database
- **REST API**: Comprehensive API for document management
- **Real-time Feedback**: Upload progress, success/error summaries

## 🚀 Quick Start

### Windows Users

Run the automated setup script:
```bash
# PowerShell
.\setup-windows.ps1

# Or batch file
setup-windows.bat
```

### Manual Setup

#### 1. Prerequisites
- Java 21+
- Node.js 16+
- Maven 3.8+
- PostgreSQL 12+

#### 2. PostgreSQL Configuration

**Create the database:**
```bash
psql -U postgres -c "CREATE DATABASE document_ai;"
```

Or use the provided setup script:
```bash
psql -U postgres -f backend/src/main/resources/setup-postgresql.sql
```

#### 3. Update Environment Variables

Create/update `.env` file in the project root:
```env
DB_URL=jdbc:postgresql://localhost:5432/document_ai
DB_USERNAME=postgres
DB_PASSWORD=postgres
DDL_AUTO=create-drop
SHOW_SQL=false
```

**For production**, change `DDL_AUTO=update` to preserve data.

#### 4. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

#### 5. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📋 Application Architecture

### Backend (Spring Boot)
- **DocumentService**: Manages file uploads and text extraction
- **ParsingService**: Supports multiple file format parsers
- **ImportService**: Processes and validates parsed data
- **StreamingImportService**: Handles large file streaming to database
- **JPA Repositories**: Spring Data JPA for database operations

### Frontend (React + Vite)
- **Drag & Drop**: React hooks for file handling
- **Progress Tracking**: Real-time upload progress
- **Error Handling**: User-friendly error messages
- **Document List**: Browse and manage uploaded documents

### Database (PostgreSQL)
- **documents table**: Stores file metadata and extracted text
- **question table**: Stores parsed questions with options and answers
- **Indexes**: Optimized for frequent queries

## 📁 File Upload Flow

1. User drags/drops file on interface
2. Frontend validates file type
3. File sent to `/api/documents/upload`
4. Backend extracts text from file
5. Data parsed into structured format
6. Results **streamed and stored** in PostgreSQL via JPA
7. Frontend displays import summary

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload file & parse data |
| POST | `/api/documents/import` | Import parsed data only |
| POST | `/api/documents/preview` | Preview file before import |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/{id}` | Get document details |
| DELETE | `/api/documents/{id}` | Delete document |

## 🛠️ Configuration

### Environment Variables

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/document_ai
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Hibernate
DDL_AUTO=create-drop          # Development
# DDL_AUTO=update             # Production
SHOW_SQL=false

# Application
SPRING_PROFILES_ACTIVE=dev
```

### Performance Tuning

The application includes:
- **Connection Pooling**: HikariCP (max 10 connections)
- **Batch Processing**: Hibernate batch size 20
- **Query Optimization**: Database indexes
- **Streaming**: Spring WebFlux for large files

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```
ERROR: Connection refused to host: localhost:5432
```
**Solution**: Verify PostgreSQL is running and `DB_URL` is correct in `.env`

### Database Does Not Exist
```
ERROR: database "document_ai" does not exist
```
**Solution**: Run database creation script or manual SQL command

### Port Already in Use
**Solution**: Change port in `backend/src/main/resources/application.yml`:
```yaml
server:
  port: 8081
```

### Maven Dependencies Error
```bash
mvn clean install -X     # Debug mode
mvn dependency:resolve   # Resolve dependencies
```

## 📚 Learn More

- [Detailed Setup Guide](./SETUP.md)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🔒 Security Notes

- `.env` file is ignored (not committed to git)
- Original files are not stored on disk
- Only extracted text and metadata are persisted
- CORS configured for cross-origin requests
- Input validation on file types

## 📝 Development Notes

- Frontend: React 18+ with Vite
- Backend: Spring Boot 3.3.2 with Java 21
- Database: PostgreSQL with JPA/Hibernate
- Supported file types: TXT, JSON, PDF, DOCX, CSV, XML
- Max file size: 10 MB (configurable)

## 🎯 Next Steps

1. Run setup script or create database manually
2. Start backend: `cd backend && mvn spring-boot:run`
3. Start frontend: `npm run dev`
4. Open `http://localhost:5173`
5. Drag and drop a file to test!

## ❓ Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) for detailed troubleshooting
2. Verify PostgreSQL is running
3. Check `.env` configuration
4. Review backend/frontend logs
