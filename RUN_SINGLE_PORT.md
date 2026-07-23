# Run on Single Port (8080) - Complete Guide

Everything now runs on a **single port: http://localhost:8080**

## Quick Start (30 Seconds)

### 1. Create PostgreSQL Database (First Time Only)

```powershell
.\setup-windows.ps1
```

Or manually:
```bash
psql -U postgres -c "CREATE DATABASE document_ai;"
```

### 2. Run Application

**Option A - Automated (Recommended)**
```powershell
.\run.ps1
```

**Option B - Manual Steps**
```powershell
# 1. Build frontend
npm run build

# 2. Start backend
cd backend
mvn spring-boot:run
```

### 3. Open Browser

```
http://localhost:8080
```

That's it! Everything is running on one port! ✅

---

## What Changed

### Frontend
- ✅ Now builds into `backend/src/main/resources/static/`
- ✅ Served by Spring Boot on port 8080
- ✅ API calls use relative URLs (`/api/*`)

### Backend
- ✅ Serves static files (React frontend)
- ✅ Handles SPA routing (all routes → index.html)
- ✅ Serves API on `/api/*`
- ✅ All on port 8080

### Result
- ✅ Single port: 8080
- ✅ Frontend + Backend + API together
- ✅ No more terminal complexity

---

## Comparison

### Before (Two Ports)
```
Terminal 1:  npm run dev          → http://localhost:5173
Terminal 2:  mvn spring-boot:run  → http://localhost:8080
             (backend API)
```

### After (Single Port)
```
Terminal 1:  .\run.ps1            → http://localhost:8080
             (frontend + backend + API)
```

---

## File Structure

```
Backend serves files:
/                   → index.html (React frontend)
/api/documents      → REST API endpoints
/api/documents/*    → REST API endpoints
/css/, /js/         → Static assets
```

---

## Common Tasks

### First Time Setup
```powershell
.\setup-windows.ps1
.\run.ps1
# Open: http://localhost:8080
```

### After Code Changes

**If you change React code:**
```powershell
# Stop current (Ctrl+C)
# Build and restart
.\run.ps1
```

**If you change Java code:**
```powershell
# Stop current (Ctrl+C)
# Build and restart
.\run.ps1
```

### Development (With Live Reload)

For frontend development with hot reload:
```powershell
# Terminal 1: Backend only
cd backend
mvn spring-boot:run

# Terminal 2: Frontend with live reload (proxies to backend)
npm run dev
```

Then open: `http://localhost:5173`
(Vite will proxy `/api/*` to backend)

---

## Troubleshooting

### Application won't start
```powershell
# Check PostgreSQL
psql -U postgres -d document_ai

# Try manual build
npm run build
cd backend
mvn clean install
mvn spring-boot:run
```

### Port 8080 already in use
```powershell
# Find what's using it
netstat -ano | findstr :8080

# Kill the process (if it's safe)
taskkill /PID <PID> /F
```

### Frontend shows blank page
```powershell
# Rebuild frontend
npm run build

# Check browser console (F12) for errors
# Check backend logs for errors

# Restart
.\run.ps1
```

### API calls failing
```powershell
# Check backend is running (should see in logs)
# Check browser console for network errors (F12)
# Check backend logs for API errors
```

---

## File Changes Made

| File | Change |
|------|--------|
| `vite.config.js` | Build output → `backend/src/main/resources/static` |
| `src/App.jsx` | API URL → relative (`/api/*`) |
| `application.yml` | Context path configured |
| `ForwardingController.java` | NEW: Routes to index.html for SPA |
| `run.ps1` | NEW: Single-command runner |
| `run.bat` | NEW: Single-command runner (batch) |

---

## Deployment

For production, just run:
```bash
./run.ps1
```

This:
1. Builds frontend as static files
2. Packages everything into JAR
3. Runs on port 8080
4. No need for separate web server

---

## Performance

- ✅ Faster - fewer processes
- ✅ Simpler - one port to manage
- ✅ Better - production-ready setup
- ✅ Easier - single startup command

---

## Next Steps

1. **Run it now**
   ```powershell
   .\run.ps1
   ```

2. **Open browser**
   ```
   http://localhost:8080
   ```

3. **Upload a file** and see it work!

---

**Everything is now on one port. You're done! 🚀**
