@echo off
REM PostgreSQL Setup for Document AI Service (Windows)
REM This script helps you create the PostgreSQL database for the application

echo.
echo ========================================
echo Document AI Service - Windows Setup
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if errorlevel 1 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo Add PostgreSQL bin directory to your system PATH
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

REM Get PostgreSQL username (default: postgres)
set /p DB_USER="Enter PostgreSQL username (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

REM Get PostgreSQL password
set /p DB_PASSWORD="Enter PostgreSQL password (default: postgres): "
if "%DB_PASSWORD%"=="" set DB_PASSWORD=postgres

REM Get PostgreSQL port
set /p DB_PORT="Enter PostgreSQL port (default: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

echo.
echo Creating database 'document_ai'...
echo.

REM Create database
psql -U %DB_USER% -h localhost -p %DB_PORT% -c "CREATE DATABASE document_ai;" 2>nul
if errorlevel 1 (
    echo WARNING: Database might already exist or connection failed
    echo You may need to create it manually using pgAdmin
)

echo.
echo Database setup attempt completed!
echo.
echo Next steps:
echo 1. Update .env file with your PostgreSQL credentials if different:
echo    - DB_USERNAME=%DB_USER%
echo    - DB_PASSWORD=%DB_PASSWORD%
echo    - DB_URL=jdbc:postgresql://localhost:%DB_PORT%/document_ai
echo.
echo 2. Open a terminal and navigate to the project root
echo.
echo 3. Start the backend:
echo    cd backend
echo    mvn spring-boot:run
echo.
echo 4. In another terminal, start the frontend:
echo    npm run dev
echo.
echo 5. Open http://localhost:5173 in your browser
echo.
echo ========================================
echo.

pause
