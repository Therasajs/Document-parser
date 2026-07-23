# PostgreSQL Setup for Document AI Service (PowerShell)
# This script helps you create the PostgreSQL database for the application

Write-Host ""
Write-Host "========================================"
Write-Host "Document AI Service - Windows Setup" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

# Check if PostgreSQL is installed
$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Source
if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Add PostgreSQL bin directory to your system PATH"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "PostgreSQL found at: $psqlPath" -ForegroundColor Green
Write-Host ""

# Get PostgreSQL credentials
$dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Enter PostgreSQL password (default: postgres)" -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dbPassword))
if ([string]::IsNullOrWhiteSpace($plainPassword)) { $plainPassword = "postgres" }

$dbPort = Read-Host "Enter PostgreSQL port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

Write-Host ""
Write-Host "Creating database 'document_ai'..." -ForegroundColor Yellow
Write-Host ""

# Create database using environment variables for password
$env:PGPASSWORD = $plainPassword
& psql -U $dbUser -h localhost -p $dbPort -c "CREATE DATABASE document_ai;" 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Database creation had issues (may already exist)" -ForegroundColor Yellow
} else {
    Write-Host "Database created successfully!" -ForegroundColor Green
}

Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================"
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update .env file with your PostgreSQL credentials:"
Write-Host "   - DB_USERNAME=$dbUser"
Write-Host "   - DB_PASSWORD=<your_password>"
Write-Host "   - DB_URL=jdbc:postgresql://localhost:$dbPort/document_ai"
Write-Host ""
Write-Host "2. Open PowerShell/CMD and navigate to project root"
Write-Host ""
Write-Host "3. Start the backend:"
Write-Host "   cd backend"
Write-Host "   mvn spring-boot:run"
Write-Host ""
Write-Host "4. In another terminal, start the frontend:"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "5. Open http://localhost:5173 in your browser"
Write-Host ""

Read-Host "Press Enter to exit"
