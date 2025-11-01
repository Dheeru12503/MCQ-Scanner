@echo off
echo ========================================
echo   MCQ Scanner Python Service
echo ========================================
echo.

cd /d "%~dp0"

if not exist "venv" (
    echo Error: Virtual environment not found!
    echo Please run setup first: .\setup.ps1
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting Python OCR Service...
echo Service will run on: http://localhost:5000
echo.
echo IMPORTANT: Keep this window open while using the MCQ Scanner app!
echo Press Ctrl+C to stop the service.
echo.
echo ========================================
echo.

python app.py

pause

