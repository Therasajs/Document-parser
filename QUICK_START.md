# Quick Start Guide - Document Import Engine

## 5-Minute Setup (Development)

### Prerequisites
- Java 21+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 12+

### 1. PostgreSQL Setup

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE document_ai;
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT ALL PRIVILEGES ON DATABASE document_ai TO app_user;
```

### 2. Initialize Schema

```powershell
psql -U postgres -d document_ai -f "backend\src\main\resources\schema-postgresql.sql"
```

### 3. Configure Database

Edit `backend\src\main\resources\application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/document_ai
    username: app_user
    password: app_password
```

### 4. Build & Run

```powershell
# Terminal 1: Start Backend
cd backend
mvn clean install
java -jar target/document-ai-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Terminal 2: Start Frontend
npm install
npm run dev
```

### 5. Access Application

```
Frontend: http://localhost:5173
Backend:  http://localhost:8080
API Docs: http://localhost:8080/api/questions
```

## Testing Import

### 1. Download Sample File

Create `test_questions.json`:
```json
[
  {
    "question": "What is the capital of France?",
    "option_a": "Lyon",
    "option_b": "Paris",
    "option_c": "Marseille",
    "option_d": "Nice",
    "correct_answer": "B",
    "difficulty": "Easy",
    "domain": "Geography"
  },
  {
    "question": "Which planet is closest to the Sun?",
    "option_a": "Venus",
    "option_b": "Mercury",
    "option_c": "Earth",
    "option_d": "Mars",
    "correct_answer": "B",
    "difficulty": "Medium",
    "domain": "Astronomy"
  }
]
```

### 2. Upload via UI

1. Open http://localhost:5173
2. Drag & drop `test_questions.json`
3. See import summary

### 3. Verify in Database

```powershell
psql -U app_user -d document_ai

SELECT COUNT(*) FROM question_bank;
SELECT question, correct_answer FROM question_bank LIMIT 5;
```

### 4. Test API

```powershell
# Get all questions
curl http://localhost:8080/api/questions

# Get single question
curl http://localhost:8080/api/questions/1

# Filter by domain
curl http://localhost:8080/api/questions/domain/Geography

# Get statistics
curl http://localhost:8080/api/questions/stats
```

## File Format Reference

### TXT Format
```
Question 1:
What is 2 + 2?

A. 1
B. 4
C. 3
D. 5

Answer: B

--------------------------------------------------

Question 2:
...
```

### JSON Format
```json
[
  {
    "question": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_answer": "B",
    "explanation": "optional",
    "difficulty": "optional",
    "domain": "optional"
  }
]
```

### CSV Format
```
question,option_a,option_b,option_c,option_d,correct_answer,difficulty,domain
"What is 2 + 2?","1","4","3","5","B","Easy","Math"
```

## Supported Formats

| Format | Support | Parser |
|--------|---------|--------|
| .txt   | ✅ | BufferedReader |
| .json  | ✅ | Jackson |
| .csv   | ✅ | OpenCSV |
| .xlsx  | ✅ | Apache POI |
| .docx  | ✅ | Apache POI XWPF |
| .pdf   | ✅ | Apache PDFBox |
| .xml   | ✅ | DOM Parser |
| .tsv   | ✅ | OpenCSV |

## API Endpoints

### Import
- `POST /api/documents/upload` - Upload & import
- `POST /api/documents/preview` - Preview without import

### Questions
- `GET /api/questions` - All questions
- `GET /api/questions/{id}` - Single question
- `GET /api/questions/domain/{domain}` - By domain
- `GET /api/questions/difficulty/{difficulty}` - By difficulty
- `GET /api/questions/stats` - Statistics

## Troubleshooting

### PostgreSQL Connection Refused
```powershell
# Check if running
Get-Service | grep postgres

# Restart
Restart-Service postgresql-x64-16
```

### Port Already in Use
```powershell
# Find process using port 8080
Get-Process | Where-Object {$_.Handles -match 8080}

# Or kill all Java processes
Get-Process java | Stop-Process -Force
```

### Clear Database
```sql
DELETE FROM question_bank;
DELETE FROM document_record;
DELETE FROM import_log;
```

## Performance Tips

- Files under 10MB process in < 1 second
- 1000 questions import in ~2-3 seconds
- Batch size optimized at 50 records
- Database queries indexed for fast lookup

## Next Steps

- Read **PRODUCTION_SETUP.md** for deployment
- Read **ARCHITECTURE.md** for system design
- Review **VALIDATION_RULES.md** for validation details
- Check **PARSER_REFERENCE.md** for format specifications

---

**Support**: Check logs in `backend/target/classes` or application console output
