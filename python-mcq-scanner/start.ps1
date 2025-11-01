Write-Host "Starting Python MCQ Scanner Service..." -ForegroundColor Green
Write-Host ""

# Activate virtual environment
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "Virtual environment not found. Run setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
try {
    python -c "import flask; import easyocr" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dependencies not installed. Run setup.ps1 first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Dependencies not installed. Run setup.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Flask app
python app.py

