# How to Start Python OCR Service

## Method 1: Double-Click (Easiest)

**Simply double-click `START_SERVICE.bat`**

This will:
- Activate the virtual environment
- Start the Python service on port 5000
- Show status messages

**Keep the window open!** Close it only when you're done using the MCQ Scanner.

## Method 2: PowerShell

Open PowerShell in this folder and run:

```powershell
.\venv\Scripts\Activate.ps1
python app.py
```

## Method 3: Command Prompt

Open Command Prompt in this folder and run:

```cmd
venv\Scripts\activate.bat
python app.py
```

## Verify It's Running

Once started, you should see:
```
Starting MCQ Scanner API...
* Running on http://127.0.0.1:5000
```

## Troubleshooting

**"Module not found" error:**
- Run: `pip install flask flask-cors pillow opencv-python numpy easyocr python-dotenv`

**Port 5000 already in use:**
- Close other apps using port 5000
- Or edit `app.py` line 274: change `port=5000` to `port=5001`

**First run is slow:**
- EasyOCR downloads models (~500MB) on first run
- This only happens once!

