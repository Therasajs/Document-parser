# Single Port Setup - Complete Summary

✅ **Everything now runs on ONE port: http://localhost:8080**

## What Was Changed

### 1. Frontend (React/Vite)
- **File**: `vite.config.js`
- ✅ Configured to build into `backend/src/main/resources/static/`
- ✅ Build output becomes part of the JAR file
- ✅ Frontend served from Spring Boot

### 2. Frontend Code (App.jsx)
- **File**: `src/App.jsx`
- ✅ Changed API URL from `http://localhost:8080` to relative URLs
- ✅ Now uses `/api/*` instead of hardcoded host
- ✅ Works on any domain/port

### 3. Backend (Spring Boot)
- **File**: `backend/src/main/resources/application.yml`
- ✅ Configured to serve static files
- ✅ Single port for everything

### 4. SPA Routing Controller
- **File**: `ForwardingController.java` (NEW)
- ✅ Handles all non-API routes
- ✅ Returns index.html for SPA routing
- ✅ React Router works correctly

### 5. Run Scripts (NEW)
- **File**: `run.ps1` (PowerShell)
- **File**: `run.bat` (Batch)
- ✅ Single command to build and run everything
- ✅ Handles frontend build + backend startup

---

## How to Run NOW

### Option 1: Automated (Easiest) ⭐

```powershell
# 1. Create database (first time only)
.\setup-windows.ps1

# 2. Run everything on one port
.\run.ps1

# 3. Open browser
http://localhost:8080
```

**That's it! Everything runs on port 8080.**

### Option 2: Manual Steps

```powershell
# 1. Create database (first time only)
psql -U postgres -c "CREATE DATABASE document_ai;"

# 2. Build frontend
npm run build

# 3. Start backend
cd backend
mvn spring-boot:run

# 4. Open browser
http://localhost:8080
```

---

## What Happens When You Run .\run.ps1

```
Step 1: Build Frontend
   → Creates: backend/src/main/resources/static/
   → Bundles React into static files

Step 2: Build Backend  
   → Compiles Java code
   → Packages frontend + backend into JAR
   → Creates: backend/target/document-ai-service-0.0.1-SNAPSHOT.jar

Step 3: Start Application
   → Starts Spring Boot on port 8080
   → Serves frontend from /
   → Serves API from /api/*
   → Opens: http://localhost:8080
```

---

## File Structure Now

```
When you visit: http://localhost:8080

/                    → index.html (React app)
/api/documents       → Backend API
/api/documents/*     → Backend API
/css/app-*.css       → Frontend styles
/js/app-*.js         → Frontend JavaScript
```

---

## Single Port Benefits

✅ **Simpler to run** - One command instead of two terminals
✅ **Production ready** - This is how apps run in production
✅ **Faster startup** - No waiting for two processes
✅ **Better UX** - No port confusion
✅ **Easy to deploy** - Just run the JAR file

---

## Testing

After running `.\run.ps1`, you'll see:

```
[INFO] Tomcat started on port(s): 8080 (http) with context path ''
[INFO] Started DocumentAiServiceApplication
```

Then:
1. Open: http://localhost:8080
2. Should see the upload interface
3. Drag a file to upload
4. See results!

---

## Development vs Production

### Development (With Hot Reload)
Want React changes to reload immediately?

```powershell
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend dev server (proxies to backend)
npm run dev
```

Then open: http://localhost:5173
(Vite will proxy `/api/*` to backend on 8080)

### Production (Single Port)
Ready to deploy?

```powershell
.\run.ps1
```

Runs on single port 8080, same as production!

---

## Troubleshooting

### Issue: "Frontend shows blank page"

**Solution**:
```powershell
# Verify frontend was built
dir backend/src/main/resources/static/index.html

# If missing, rebuild
npm run build

# Restart
.\run.ps1
```

### Issue: "API calls show 404 errors"

**Solution**:
```powershell
# Check backend logs for errors
# Should see: Mapped POST /api/documents/upload

# Verify it's running:
curl http://localhost:8080/api/documents
```

### Issue: "Port 8080 already in use"

**Solution**:
```powershell
# Find what's using it
netstat -ano | findstr :8080

# Kill it
taskkill /PID <PID> /F
```

### Issue: "npm run build fails"

**Solution**:
```powershell
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run build
```

---

## Performance

### Build Time
- First run: ~1 minute (includes dependencies)
- Subsequent runs: ~20-30 seconds

### Startup Time
- Application starts in 5-10 seconds
- Ready to use immediately

### Runtime
- Single JVM process
- Efficient resource usage
- Suitable for small to medium deployments

---

## File Checklist

✅ Files Changed:
- `vite.config.js` - Build output location
- `src/App.jsx` - API URL to relative
- `backend/src/main/resources/application.yml` - Static serving

✅ Files Created:
- `backend/src/main/java/.../controller/ForwardingController.java`
- `run.ps1` - PowerShell runner
- `run.bat` - Batch runner
- `RUN_SINGLE_PORT.md` - This guide
- `SINGLE_PORT_SUMMARY.md` - Summary

---

## Commands Reference

```powershell
# Create database (first time)
.\setup-windows.ps1

# Run everything
.\run.ps1

# Manual build
npm run build
cd backend && mvn spring-boot:run

# Clean build
npm run build
cd backend && mvn clean package -DskipTests

# Check if running
curl http://localhost:8080

# Stop application
Ctrl+C
```

---

## Next Steps

1. **Right now**
   ```powershell
   .\setup-windows.ps1
   .\run.ps1
   ```

2. **Visit**
   ```
   http://localhost:8080
   ```

3. **Upload a file** and watch it work!

---

## Summary

- ✅ **One port**: 8080
- ✅ **One command**: `.\run.ps1`
- ✅ **One browser tab**: http://localhost:8080
- ✅ **Production ready**: Same setup as production
- ✅ **Simple setup**: Everything is self-contained

**You're all set! Run it now! 🚀**

```powershell
.\run.ps1
```

Then open: **http://localhost:8080**
