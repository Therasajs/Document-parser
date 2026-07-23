# Setup Verification Checklist

Use this checklist to verify your installation is correct before running the application.

## Prerequisites Check ✅

- [ ] Java 21+ installed
  ```bash
  java -version
  # Should show: openjdk version "21..." or higher
  ```

- [ ] Maven installed
  ```bash
  mvn -version
  # Should show: Apache Maven 3.8+
  ```

- [ ] Node.js 16+ installed
  ```bash
  node -v
  npm -v
  # Should show: v16+ and v7+
  ```

- [ ] PostgreSQL installed and running
  ```bash
  psql --version
  # Should show: psql (PostgreSQL) 12+
  ```

## PostgreSQL Database Check ✅

- [ ] PostgreSQL service is running
  - Windows: Services → PostgreSQL should be running
  - Or: `psql -U postgres` should connect

- [ ] Database 'document_ai' exists
  ```bash
  psql -U postgres -l
  # Look for 'document_ai' in the list
  ```
  
  If not, create it:
  ```bash
  psql -U postgres -c "CREATE DATABASE document_ai;"
  ```

- [ ] Can connect to database
  ```bash
  psql -U postgres -d document_ai
  # Should show: document_ai=#
  ```

- [ ] Tables will be created on first run
  - Hibernate will auto-create tables
  - Or manually create with: `psql -U postgres -f backend/src/main/resources/setup-postgresql.sql`

## Configuration Check ✅

- [ ] `.env` file exists in project root
  ```bash
  dir .env  # Windows
  ls -la .env  # Linux/Mac
  ```

- [ ] `.env` has correct PostgreSQL credentials
  ```
  DB_URL=jdbc:postgresql://localhost:5432/document_ai
  DB_USERNAME=postgres
  DB_PASSWORD=<your-password>
  ```

- [ ] `.env.example` shows all available options

- [ ] `.gitignore` includes `.env` (prevents credential leaks)
  ```bash
  grep ".env" .gitignore
  # Should show: .env in the list
  ```

## Backend Check ✅

- [ ] Maven dependencies can be resolved
  ```bash
  cd backend
  mvn dependency:resolve
  # Should show: BUILD SUCCESS
  ```

- [ ] Backend can be built
  ```bash
  mvn clean install
  # Should show: BUILD SUCCESS
  # Creates: target/document-ai-service-0.0.1-SNAPSHOT.jar
  ```

- [ ] Backend starts without errors
  ```bash
  mvn spring-boot:run
  # Should show: Started DocumentAiServiceApplication in X seconds
  # Listen on: http://localhost:8080
  ```

- [ ] Backend health check passes
  ```bash
  curl http://localhost:8080/health 2>/dev/null || 
  Invoke-WebRequest http://localhost:8080/health  # Windows PowerShell
  ```

- [ ] Backend can connect to database
  - Check logs for: `HikariPool-1 - Starting...`
  - Check logs for: `No errors initializing the pool`
  - No `Connection refused` errors

## Frontend Check ✅

- [ ] Node modules installed
  ```bash
  npm install
  # Should show: added X packages
  ```

- [ ] Frontend can start
  ```bash
  npm run dev
  # Should show: VITE v4.X.X ready in XXX ms
  # ➜ Local: http://localhost:5173/
  ```

- [ ] Frontend UI loads
  - Open http://localhost:5173 in browser
  - Should see: "Import Questions" page
  - Upload area is visible
  - No errors in browser console

- [ ] Frontend connects to backend
  - Upload area is clickable
  - File selection works
  - No "Cannot POST" errors in console

## Integration Test ✅

- [ ] Backend is running on port 8080
  ```bash
  netstat -ano | findstr :8080  # Windows
  lsof -i :8080  # Mac/Linux
  ```

- [ ] Frontend is running on port 5173
  ```bash
  netstat -ano | findstr :5173  # Windows
  lsof -i :5173  # Mac/Linux
  ```

- [ ] Can access API endpoints
  ```bash
  # List documents (should return empty array [])
  curl http://localhost:8080/api/documents 2>/dev/null
  ```

- [ ] Create test file: `test.txt`
  ```txt
  Question: What is 2+2?
  Option A: 3
  Option B: 4
  Option C: 5
  Answer: B
  ```

- [ ] Upload test file
  - Go to http://localhost:5173
  - Drag `test.txt` onto upload area
  - Click "Upload Document"
  - Should show success message
  - Should show import summary with counts

- [ ] Data stored in PostgreSQL
  ```bash
  psql -U postgres -d document_ai
  
  # Check documents table
  SELECT * FROM documents;
  # Should show 1 row with your test file
  
  # Check questions table
  SELECT * FROM question;
  # Should show 1 row with your question
  
  # Exit
  \q
  ```

- [ ] Can list uploaded documents via API
  ```bash
  curl http://localhost:8080/api/documents 2>/dev/null
  # Should return JSON array with your document
  ```

## Performance Check ✅

- [ ] Backend startup time is reasonable
  - Should start in < 10 seconds
  - Check logs for timing

- [ ] Upload is responsive
  - No timeout errors
  - Progress bar updates smoothly
  - Response time < 5 seconds for small files

- [ ] No memory leaks visible
  - Check system memory usage
  - Should remain stable after uploads

## Common Issues Resolution ✅

If any check failed, refer to:

| Issue | Solution |
|-------|----------|
| Can't connect to PostgreSQL | Run `psql -U postgres` first to verify it's running |
| Database doesn't exist | Run `psql -U postgres -c "CREATE DATABASE document_ai;"` |
| Port already in use | Change port in `backend/src/main/resources/application.yml` |
| Maven build fails | Run `mvn clean install -X` for debug output |
| Frontend won't start | Run `npm install` first, then `npm run dev` |
| CORS errors | Ensure backend and frontend URLs are correct |
| File upload fails | Check backend logs for parsing errors |

## Final Verification ✅

- [ ] All checks above passed
- [ ] Backend running and healthy
- [ ] Frontend loading without errors
- [ ] Can upload and parse test file
- [ ] Data appears in PostgreSQL
- [ ] API endpoints respond correctly
- [ ] No critical errors in logs

## Status

When all boxes are checked:

```
✅ Setup is complete and verified!
```

You're ready to:
1. Upload real documents
2. Deploy to production
3. Scale the application
4. Integrate with other services

## What to Do Next

1. **Test with different file types**: TXT, CSV, JSON, PDF, DOCX, XML
2. **Create sample data**: Upload multiple documents
3. **Query the database**: Explore the stored data
4. **Monitor logs**: Watch backend logs during uploads
5. **Deploy**: Follow deployment guide when ready

## Need Help?

1. Check [SETUP.md](./SETUP.md) for detailed setup guide
2. Check [QUICKSTART.md](./QUICKSTART.md) for quick reference
3. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture
4. Check backend logs: look for ERROR or EXCEPTION lines
5. Verify PostgreSQL: `psql -U postgres -d document_ai`

---

**When done, you have a fully functional document upload and parsing system! 🎉**
