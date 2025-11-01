# Quick Start - Python OCR Service

## Step 1: Install Dependencies

Open PowerShell in the `python-mcq-scanner` folder and run:

```powershell
.\venv\Scripts\Activate.ps1
pip install flask flask-cors pillow opencv-python numpy easyocr python-dotenv
```

**Note:** This will take 5-10 minutes the first time as it downloads large packages (PyTorch, EasyOCR models, etc.)

## Step 2: Start the Service

After installation completes, keep the terminal open and run:

```powershell
python app.py
```

You should see:
```
Starting MCQ Scanner API...
* Running on http://127.0.0.1:5000
```

## Step 3: Keep It Running

**IMPORTANT:** Keep this terminal window open while using the MCQ Scanner app. The Python service must be running for image scanning to work.

## Troubleshooting

If you get "Module not found":
- Make sure virtual environment is activated: `.\venv\Scripts\Activate.ps1`
- Re-run the pip install command

If port 5000 is busy:
- Close other apps using port 5000
- Or change port in `app.py` line 276: `app.run(port=5001)`

