# Quick Start Guide - 5 Minutes to Running

## TL;DR - Windows Users

```powershell
# 1. Run setup script
.\setup-windows.ps1

# 2. Start backend (one terminal)
cd backend
mvn spring-boot:run

# 3. Start frontend (another terminal)
npm run dev

# 4. Open http://localhost:5173 and drag-drop a file!
```

## 1️⃣ Create PostgreSQL Database

### Option A: Using Windows Setup Script (Recommended)
```powershell
.\setup-windows.ps1
```

### Option B: Manual Setup
Open PostgreSQL command line:
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE document_ai;
\q
```

### Option C: Using SQL File
```bash
psql -U postgres -f backend/src/main/resources/setup-postgresql.sql
```

## 2️⃣ Configure Environment (If Needed)

Edit `.env` file (already created with defaults):
```env
DB_URL=jdbc:postgresql://localhost:5432/document_ai
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Change these only if your PostgreSQL is different.

## 3️⃣ Start Backend

```bash
cd backend
mvn spring-boot:run
```

✅ Wait for: `Started DocumentAiServiceApplication`

Backend URL: `http://localhost:8080`

## 4️⃣ Start Frontend (New Terminal)

```bash
npm install  # First time only
npm run dev
```

✅ Look for: `Local: http://localhost:5173`

## 5️⃣ Test the Application

1. Open `http://localhost:5173` in browser
2. Drag a `.txt` or `.json` file onto the upload area
3. Click "Upload Document"
4. See data imported to PostgreSQL! ✨

## 📝 Example Test Files

### TXT Format
```
Question: What is the capital of France?
Option A: Paris
Option B: London
Option C: Berlin
Answer: A
```

### JSON Format
```json
[
  {
    "question": "What is 2+2?",
    "optionA": "3",
    "optionB": "4",
    "optionC": "5",
    "answer": "optionB"
  }
]
```

### CSV Format
```
question,optionA,optionB,answer
"What is the sky color?","Blue","Red","Blue"
"What is 1+1?","1","2","2"
```

## ⚙️ If Something Goes Wrong

### Backend won't start
```bash
# Check PostgreSQL is running
# Update .env with correct DB credentials
# Try: mvn clean install
```

### Can't connect to database
```bash
# Create database:
psql -U postgres -c "CREATE DATABASE document_ai;"

# Or verify connection:
psql -U postgres -d document_ai
```

### Port already in use
```bash
# Backend port 8080:
# Change in: backend/src/main/resources/application.yml
#   server.port: 8081

# Frontend port 5173:
# npm run dev -- --port 5174
```

## 📁 Project Structure
```
project/
├── backend/              # Spring Boot API
│   └── pom.xml          # Dependencies
├── src/                 # React Frontend
│   └── App.jsx          # Main component
├── .env                 # PostgreSQL config
├── README.md            # Full documentation
└── SETUP.md             # Detailed setup guide
```

## 🎯 What Happens When You Upload

1. **Pick File** → Drag & drop on interface
2. **Validate** → Frontend checks file type
3. **Upload** → Sent to backend
4. **Extract** → Backend extracts text from file
5. **Parse** → Data parsed (questions, answers, options)
6. **Stream** → Data streamed to PostgreSQL using JPA
7. **Save** → Stored in database
8. **Display** → Summary shown with success/failure counts

## 📊 Database Tables

### documents
Stores uploaded files:
- id, file_name, file_type, file_size, extracted_text, uploaded_at

### question
Stores parsed questions:
- id, question_text, options_json, correct_answer, created_at

## 🚀 Ready to Deploy?

When deploying:

1. Change in `.env`:
   ```env
   DDL_AUTO=update  # Instead of create-drop
   ```

2. Update database URL for production server

3. Change React API URL if backend is on different server:
   ```bash
   VITE_API_URL=https://your-api.com npm run dev
   ```

4. Build frontend:
   ```bash
   npm run build
   ```

## 💡 Pro Tips

- Max file size: 10 MB (change in application.yml)
- Supported: TXT, JSON, PDF, DOCX, CSV, XML
- Add more file types in backend/src/main/java/.../parser/
- View database with: `psql -U postgres -d document_ai`
- Check logs with: grep "ERROR" in console output

## 🆘 Need Help?

1. See full docs: [README.md](./README.md)
2. Detailed setup: [SETUP.md](./SETUP.md)
3. Check backend logs for errors
4. Verify PostgreSQL: `psql -U postgres -l`

---

**That's it! You're ready to upload documents. Let's go! 🚀**
