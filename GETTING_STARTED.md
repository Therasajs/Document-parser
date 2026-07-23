# Getting Started - Complete Overview

Welcome! You now have a fully configured Document AI Service. This guide explains what was built and how to get running in the next 5 minutes.

## 📦 What You Have

A complete full-stack application with:

### Frontend (React + Vite)
- Modern drag-and-drop interface
- Real-time upload progress
- File type validation
- Import summary display
- Responsive design

### Backend (Spring Boot 3 + Java 21)
- REST API for document management
- Multi-format file parser (TXT, JSON, PDF, DOCX, CSV, XML)
- Automatic text extraction
- Data parsing with validation
- Streaming support for large files

### Database (PostgreSQL)
- Stores documents and metadata
- Stores parsed questions with answers
- Optimized with indexes
- Transaction support

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Database (Choose One)

**Option A - Automated (Recommended for Windows)**
```powershell
.\setup-windows.ps1
```

**Option B - Manual**
```bash
psql -U postgres -c "CREATE DATABASE document_ai;"
```

### Step 2: Start Backend

```bash
cd backend
mvn spring-boot:run
```

Wait for: `Started DocumentAiServiceApplication`

### Step 3: Start Frontend (New Terminal)

```bash
npm install  # First time only
npm run dev
```

Wait for: `Local: http://localhost:5173`

### Step 4: Upload a File

1. Open http://localhost:5173
2. Drag a .txt or .json file onto the upload area
3. Click "Upload Document"
4. See data imported! ✨

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env` | PostgreSQL configuration |
| `application.yml` | Backend settings |
| `App.jsx` | Frontend UI |
| `QUICKSTART.md` | 5-minute setup |
| `SETUP.md` | Detailed guide |
| `VERIFY_SETUP.md` | Checklist |
| `DEPLOY.md` | Production setup |
| `IMPLEMENTATION_SUMMARY.md` | Technical details |

## 🔑 Key Features

### Upload & Parse
- Drag files directly onto the interface
- Automatic format detection
- Text extraction and data parsing
- Streaming to PostgreSQL

### Data Storage
- Documents stored with metadata
- Parsed questions with options and answers
- Unique constraints prevent duplicates
- Database indexes for fast queries

### API Endpoints
```
POST   /api/documents/upload    - Upload & parse file
GET    /api/documents           - List documents
GET    /api/documents/{id}      - Get document details
DELETE /api/documents/{id}      - Delete document
POST   /api/documents/preview   - Preview before import
POST   /api/documents/import    - Import parsed data
```

## ⚙️ Configuration

All configuration is in `.env`:

```env
# Database connection
DB_URL=jdbc:postgresql://localhost:5432/document_ai
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Environment
DDL_AUTO=create-drop  # Development (use 'update' for production)
SHOW_SQL=false
```

## 🧪 Test the Application

### Sample Test File (test.json)

```json
[
  {
    "question": "What is the capital of France?",
    "optionA": "Paris",
    "optionB": "London",
    "optionC": "Berlin",
    "answer": "optionA"
  },
  {
    "question": "What is 2+2?",
    "optionA": "3",
    "optionB": "4",
    "optionC": "5",
    "answer": "optionB"
  }
]
```

### Upload Steps

1. Save above as `test.json`
2. Go to http://localhost:5173
3. Drag `test.json` onto upload area
4. Click "Upload Document"
5. See success message!

### Verify in Database

```bash
psql -U postgres -d document_ai
SELECT * FROM documents;      -- Shows uploaded files
SELECT * FROM question;       -- Shows parsed questions
\q
```

## 📚 Documentation

- **[README.md](./README.md)** - Complete project overview
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup
- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[VERIFY_SETUP.md](./VERIFY_SETUP.md)** - Verification checklist
- **[DEPLOY.md](./DEPLOY.md)** - Production deployment
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical architecture

## 🔧 Troubleshooting

### PostgreSQL won't connect
```
ERROR: Connection refused to host: localhost:5432
```
**Fix**: Start PostgreSQL or verify connection string in `.env`

### Database doesn't exist
```
ERROR: database "document_ai" does not exist
```
**Fix**: Run setup script or: `psql -U postgres -c "CREATE DATABASE document_ai;"`

### Port already in use
**Fix**: Change port in `backend/src/main/resources/application.yml`

### Maven build fails
**Fix**: `mvn clean install -X` for debug output

## 🎯 Next Steps

### 1. Immediate (Now)
- [ ] Create PostgreSQL database
- [ ] Start backend: `mvn spring-boot:run`
- [ ] Start frontend: `npm run dev`
- [ ] Upload test file

### 2. Soon (Next Session)
- [ ] Test all file formats (TXT, CSV, JSON, PDF, DOCX, XML)
- [ ] Upload multiple documents
- [ ] Query database for results
- [ ] Review logs and metrics

### 3. Later (Before Production)
- [ ] Change `DDL_AUTO=update` in `.env`
- [ ] Setup production PostgreSQL
- [ ] Configure security (HTTPS, credentials)
- [ ] Follow [DEPLOY.md](./DEPLOY.md) guide
- [ ] Setup monitoring and backups

## 📊 System Requirements

### Development
- Java 21+
- Node.js 16+
- Maven 3.8+
- PostgreSQL 12+
- 2 GB RAM
- 500 MB disk

### Production
- Java 21+
- PostgreSQL 12+ (managed service recommended)
- 4+ GB RAM
- 10+ GB disk
- Load balancer (optional)
- SSL certificate

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Browser   │
│ React+Vite  │
└──────┬──────┘
       │ HTTP/HTTPS
┌──────▼──────────────────────┐
│    Nginx/Apache             │
│  (Reverse Proxy Optional)   │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│  Spring Boot Backend        │
│  - DocumentService         │
│  - ParsingService          │
│  - ImportService           │
│  - JPA/Hibernate           │
└──────┬──────────────────────┘
       │ JDBC
┌──────▼──────────────────────┐
│  PostgreSQL Database        │
│  - documents table         │
│  - question table          │
└──────────────────────────────┘
```

## 🔐 Security

The application includes:
- ✅ Input validation
- ✅ SQL injection prevention (JPA)
- ✅ CORS configuration
- ✅ `.env` excluded from git (no credential leaks)
- ✅ Transaction management
- ✅ File type validation

## 📈 Performance

Optimizations included:
- Connection pooling (HikariCP)
- Batch processing (Hibernate)
- Query optimization (Indexes)
- Streaming support (WebFlux)
- Caching ready

## 🆘 Getting Help

1. **Check logs first**
   - Backend: Console output or `app.log`
   - Frontend: Browser console (F12)
   - Database: PostgreSQL logs

2. **Read documentation**
   - [SETUP.md](./SETUP.md) - Detailed setup
   - [VERIFY_SETUP.md](./VERIFY_SETUP.md) - Checklist
   - [DEPLOY.md](./DEPLOY.md) - Production

3. **Common fixes**
   - Restart PostgreSQL
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Maven cache: `mvn clean`
   - Check firewall and ports

## 📝 Development Notes

### File Type Support
- TXT: Plain text extraction
- JSON: Array of objects parsing
- CSV: Row-based parsing
- PDF: Text extraction
- DOCX: Document parsing
- XML: Structured data parsing

### Extending the Application

To add a new file type:
1. Create parser in `backend/.../parser/impl/NewParser.java`
2. Register in `SupportedFileType.java`
3. Add to `DocumentParser.java`
4. Update frontend file validation

### Database Schema

Tables are auto-created on first run via Hibernate. Manual schema is available at:
- `backend/src/main/resources/schema.sql`
- `backend/src/main/resources/setup-postgresql.sql`

## 🎉 Success Indicators

You've successfully set up when:

✅ Backend starts without errors
✅ Frontend loads at http://localhost:5173
✅ Can select and upload files
✅ See import summary with success count
✅ Data appears in PostgreSQL
✅ No errors in logs or console

## 📞 Support

**Issue Type** | **Solution**
---|---
Connection error | Verify PostgreSQL running
Port in use | Change port in `application.yml`
Missing dependency | Run `mvn clean install`
Frontend error | `npm install && npm run dev`
Database error | Check `.env` configuration

---

## Ready?

You have everything you need! 

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE document_ai;"

# 2. Start backend (Terminal 1)
cd backend && mvn spring-boot:run

# 3. Start frontend (Terminal 2)
npm run dev

# 4. Open browser
http://localhost:5173

# 5. Upload a file! 🚀
```

**That's it! Welcome aboard! 🎊**

For detailed information, see [README.md](./README.md)
