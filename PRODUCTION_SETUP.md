# Production-Ready Document Import Engine Setup Guide

## System Requirements

- **Java**: OpenJDK 21 or later
- **PostgreSQL**: 12 or later
- **Node.js**: 18+ (for frontend build)
- **Maven**: 3.8+
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 10GB for application and database

## Architecture Overview

```
Frontend (React + Vite)
    ↓
Spring Boot 3.3.2 REST API
    ├─ File Type Detection
    ├─ Format-Specific Parsers
    ├─ Validation Engine
    ├─ Duplicate Detection
    └─ Batch Database Insert
    ↓
PostgreSQL Database
    └─ Normalized Question Storage
```

## Installation & Configuration

### 1. PostgreSQL Setup (Windows)

#### Install PostgreSQL 16+
```powershell
# Download from: https://www.postgresql.org/download/windows/

# After installation, open PowerShell as Administrator:
$postgresPath = "C:\Program Files\PostgreSQL\16\bin"
$env:Path += ";$postgresPath"
```

#### Create Database
```powershell
psql -U postgres -c "CREATE DATABASE document_ai;"
psql -U postgres -c "CREATE USER app_user WITH PASSWORD 'secure_password_here';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE document_ai TO app_user;"
```

#### Initialize Schema
```powershell
psql -U postgres -d document_ai -f "backend\src\main\resources\schema-postgresql.sql"
```

### 2. Configure application.yml

Edit `backend\src\main\resources\application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/document_ai
    username: app_user
    password: secure_password_here
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

### 3. Build Backend

```powershell
cd backend
mvn clean package -DskipTests
```

**Output**: `backend\target\document-ai-service-0.0.1-SNAPSHOT.jar`

### 4. Build Frontend

```powershell
npm install
npm run build
```

**Output**: `dist/` directory

### 5. Copy Frontend to Backend

```powershell
Copy-Item -Path "dist\*" -Destination "backend\src\main\resources\static" -Recurse -Force
```

Rebuild backend:
```powershell
cd backend
mvn clean package -DskipTests
```

### 6. Run Application

```powershell
java -jar backend\target\document-ai-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Access at: **http://localhost:8080**

## Supported File Formats

| Format | Parser | Detection | Validation |
|--------|--------|-----------|-----------|
| .txt | BufferedReader | Extension | ✓ Structured format |
| .json | Jackson | Extension | ✓ Valid JSON schema |
| .csv | OpenCSV | Extension | ✓ Header validation |
| .xlsx | Apache POI | Extension | ✓ Cell type handling |
| .docx | Apache POI XWPF | Extension | ✓ Paragraph extraction |
| .pdf | Apache PDFBox | Extension | ✓ Text extraction |
| .xml | DOM Parser | Extension | ✓ XML schema |
| .doc | Apache POI | Extension | ✓ Legacy support |

## File Format Examples

### TXT Format (Recommended)
```
Question 1:
What is the capital of France?

A. Lyon
B. Paris
C. Marseille
D. Nice

Answer: B

--------------------------------------------------

Question 2:
...
```

### JSON Format
```json
[
  {
    "question": "What is the capital of France?",
    "option_a": "Lyon",
    "option_b": "Paris",
    "option_c": "Marseille",
    "option_d": "Nice",
    "correct_answer": "B",
    "explanation": "Paris is the capital of France",
    "difficulty": "Easy",
    "domain": "Geography"
  }
]
```

### CSV Format
```csv
question,option_a,option_b,option_c,option_d,correct_answer,difficulty,domain
"What is the capital of France?","Lyon","Paris","Marseille","Nice","B","Easy","Geography"
```

## Validation Rules

Every question is validated against:

1. **Question Text**
   - Not empty (required)
   - Min 5 characters, Max 5000 characters
   - Cannot be only numbers

2. **Options**
   - At least 2 options required (A-D)
   - Each non-empty option: 1-2000 characters
   - All 4 options can be provided

3. **Correct Answer**
   - Must be A, B, C, or D
   - Must reference a non-empty option
   - Case-insensitive (a, A, b, B accepted)

4. **Optional Fields**
   - Explanation: Text explanation (optional)
   - Difficulty: Easy, Medium, Hard, or custom (optional)
   - Domain: Subject/category (optional)

## Duplicate Detection

Duplicate detection uses **normalized text comparison**:

1. **Normalization Rules**:
   - Convert to lowercase
   - Remove punctuation: . , ; : ! ? " ' ( ) - – —
   - Normalize whitespace (multiple spaces → single space)
   - Remove accents and diacritics
   - Normalize line breaks and special characters
   - Trim whitespace

2. **Example**:
   ```
   Original:    "What is the capital of FRANCE?"
   Normalized:  "what is the capital of france"
   
   Original:    "what   is... the capital of france?"
   Normalized:  "what is the capital of france"
   
   Result: DUPLICATE (exact match after normalization)
   ```

3. **Configuration**:
   - Default: Exact match after normalization
   - Optional: Fuzzy matching with configurable threshold (0.0-1.0)

## Import Process

### Step 1: File Upload
```
POST /api/documents/upload
Content-Type: multipart/form-data
- file: questions.json
```

### Step 2: File Detection
- Detect extension (.txt, .json, .csv, etc.)
- Route to appropriate parser
- No AI/LLM involved—deterministic parsing

### Step 3: Text Extraction
- Parse file using format-specific library
- Convert to internal ParsedRow format
- Extract question, options, answer, metadata

### Step 4: Validation
- Validate each question
- Check for missing fields
- Verify option references
- Build list of validation errors

### Step 5: Duplicate Detection
- Normalize question text
- Query database for normalized text
- Skip if duplicate found
- Log duplicate reason

### Step 6: Database Insert (Batch)
- Collect validated questions (batch size = 50)
- Use `saveAll()` for efficient bulk insert
- Transaction handles rollback on error

### Step 7: Import Summary
```json
{
  "totalRecords": 100,
  "savedRecords": 98,
  "duplicateRecords": 2,
  "failedRecords": 0,
  "processingTimeMs": 1234,
  "processedAt": "2024-01-15T10:30:00",
  "errors": ["Row 5: duplicate question - Exact match (ID: 42)"],
  "duplicateReasons": ["Row 5: duplicate question - Exact match (ID: 42)"]
}
```

## API Endpoints

### Import Operations
- `POST /api/documents/upload` - Upload file and import questions
- `POST /api/documents/preview` - Preview extracted data without importing
- `POST /api/documents/import` - Import parsed data

### Question Management
- `GET /api/questions` - Get all questions
- `GET /api/questions/{id}` - Get single question
- `GET /api/questions/domain/{domain}` - Filter by domain
- `GET /api/questions/difficulty/{difficulty}` - Filter by difficulty
- `GET /api/questions/stats` - Get question statistics
- `DELETE /api/questions/{id}` - Delete question
- `DELETE /api/questions` - Delete all questions

### Document Management
- `GET /api/documents` - List uploaded documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document

## Performance Tuning

### Database Optimization
```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50        # Optimize batch inserts
          fetch_size: 100       # Optimize query fetches
        order_inserts: true     # Order INSERT statements
        order_updates: true     # Order UPDATE statements
```

### Connection Pool
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20    # Max connections
      minimum-idle: 5          # Min idle connections
      connection-timeout: 30000 # 30 seconds
      max-lifetime: 1800000    # 30 minutes
```

### Indexing
- `idx_question_text` on `question_normalized` (HASH index for exact match)
- `idx_domain` on `domain` (for filtering)
- `idx_difficulty` on `difficulty` (for filtering)
- `idx_created_at` on `created_at` (for sorting)

## Error Handling

### Validation Errors
- Missing question text
- Insufficient options (< 2)
- Invalid answer reference
- Question too short/long (< 5 or > 5000 chars)
- Option too long (> 2000 chars)

### Parsing Errors
- Corrupted file format
- Invalid JSON syntax
- Malformed CSV headers
- Broken PDF structure
- Invalid DOCX markup
- Malformed XML

### Database Errors
- Connection pool exhausted
- Transaction timeout
- Constraint violations
- Disk space full

**Error Handling Policy**: 
- Continue processing on error
- Log individual errors with row numbers
- Return partial results with error summary
- Never stop entire import on single record failure

## Monitoring & Maintenance

### Monitor Import Success Rate
```sql
SELECT 
  DATE_TRUNC('day', processed_at) AS date,
  COUNT(*) AS total_imports,
  SUM(saved_records) AS total_saved,
  SUM(duplicate_records) AS total_duplicates
FROM import_log
GROUP BY DATE_TRUNC('day', processed_at)
ORDER BY date DESC;
```

### Clean Old Records
```sql
-- Archive questions older than 1 year
DELETE FROM question_bank WHERE created_at < NOW() - INTERVAL '1 year';

-- Archive import logs older than 3 months
DELETE FROM import_log WHERE processed_at < NOW() - INTERVAL '3 months';
```

### Check Database Health
```sql
-- Find duplicate questions by normalized text
SELECT question_normalized, COUNT(*) FROM question_bank 
GROUP BY question_normalized 
HAVING COUNT(*) > 1;

-- Check failed imports
SELECT * FROM import_log WHERE failed_records > 0 
ORDER BY processed_at DESC LIMIT 10;
```

## Security Considerations

### Production Hardening
1. **Database Security**
   - Change default password
   - Create limited-privilege user
   - Enable SSL/TLS connections
   - Restrict access to localhost initially

2. **Application Security**
   - Enable HTTPS
   - Use environment variables for credentials
   - Implement API authentication (JWT/OAuth)
   - Add CORS configuration
   - Enable SQL injection protection (JPA uses parameterized queries)

3. **File Upload Security**
   - Limit file size (currently 50MB)
   - Validate file extensions
   - Scan for malware
   - Store files in isolated directory
   - Implement rate limiting

4. **Audit Logging**
   - Track all imports
   - Log user actions
   - Monitor database changes
   - Alert on failures

## Troubleshooting

### "Connection refused" to PostgreSQL
```powershell
# Check if PostgreSQL service is running
Get-Service | Where-Object {$_.Name -eq "postgresql-x64-16"}

# Or restart the service
Restart-Service postgresql-x64-16
```

### "Database does not exist"
```powershell
psql -U postgres -c "CREATE DATABASE document_ai;"
psql -U postgres -d document_ai -f "backend\src\main\resources\schema-postgresql.sql"
```

### Import taking too long
- Check batch size (default: 50)
- Verify database connection pool
- Monitor CPU and memory usage
- Check disk I/O performance

### High memory usage
- Reduce file upload size limit
- Decrease batch size
- Increase database connection timeouts
- Add more RAM to server

## Deployment Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created with schema initialized
- [ ] Backend built (`mvn clean package`)
- [ ] Frontend built (`npm run build`)
- [ ] Static files copied to backend resources
- [ ] application.yml configured with production settings
- [ ] Database credentials in environment variables (not hardcoded)
- [ ] HTTPS/SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Tested with sample import files
- [ ] Performance load test completed
- [ ] Error handling verified
- [ ] Security audit completed

## Support & Documentation

- **Logs**: Check `logs/` directory for detailed error messages
- **Database Queries**: Use SQL tools (psql, pgAdmin) for diagnostics
- **Performance Metrics**: Monitor application performance metrics
- **API Documentation**: Access Swagger UI at `/swagger-ui.html` (if enabled)

---

**Last Updated**: January 2025
**Version**: 1.0.0 (Production Ready)
