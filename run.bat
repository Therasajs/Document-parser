@echo off
REM Single-Port Project Runner
REM Runs entire application on http://localhost:8080

echo.
echo ========================================
echo Document AI Service - Single Port Setup
echo ========================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: backend directory not found
    pause
    exit /b 1
)

REM Build frontend
echo [1/3] Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo.
echo [2/3] Building backend...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo ERROR: Backend build failed
    cd ..
    pause
    exit /b 1
)

echo.
echo [3/3] Starting application...
echo.
echo ========================================
echo ✅ Application Starting...
echo ========================================
echo.
echo 📱 Application URL: http://localhost:8080
echo.
echo Press Ctrl+C to stop the application
echo.

call mvn spring-boot:run

pause
