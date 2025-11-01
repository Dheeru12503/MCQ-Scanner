# Python OCR Service Setup Guide

This guide will help you set up the Python-based OCR service for MCQ scanning.

## Quick Start

### Windows Setup

1. **Open a new terminal/command prompt**

2. **Navigate to the Python scanner directory:**
   ```bash
   cd python-mcq-scanner
   ```

3. **Run the setup script:**
   ```bash
   setup.bat
   ```
   This will:
   - Create a virtual environment
   - Install all required dependencies
   - Download EasyOCR models (first time only, ~500MB)

4. **Start the Python service:**
   ```bash
   start.bat
   ```
   Or manually:
   ```bash
   python app.py
   ```

5. **Verify it's running:**
   - You should see: `Starting MCQ Scanner API...`
   - Service will be available at: `http://localhost:5000`

### macOS/Linux Setup

1. **Open a terminal**

2. **Navigate to the Python scanner directory:**
   ```bash
   cd python-mcq-scanner
   ```

3. **Make scripts executable:**
   ```bash
   chmod +x setup.sh start.sh
   ```

4. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

5. **Start the Python service:**
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   python3 app.py
   ```

## Manual Setup (If scripts don't work)

1. **Create virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the service:**
   ```bash
   python app.py
   ```

## First Run Notes

- **EasyOCR** will download language models on first run (~500MB)
- This only happens once - subsequent runs are faster
- Make sure you have internet connection for first run

## Troubleshooting

### "Python not found"
- Install Python 3.8+ from [python.org](https://www.python.org/downloads/)
- Make sure Python is added to PATH

### "Module not found"
- Make sure virtual environment is activated
- Run: `pip install -r requirements.txt`

### "Port 5000 already in use"
- Close other applications using port 5000
- Or change port in `app.py`: `app.run(port=5001)`

### Slow OCR
- First run downloads models (wait for it)
- Subsequent runs are much faster
- Use higher resolution images for better accuracy

### Poor OCR Results
- Use clear, high-resolution images
- Ensure text is not rotated or skewed
- Good lighting and contrast in images
- Try preprocessing images before scanning

## Testing the Service

1. **Check health endpoint:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"healthy","service":"MCQ Scanner"}`

2. **Test with an image:**
   - Open Postman or use curl
   - POST to `http://localhost:5000/scan`
   - Attach an image file

## Next.js Integration

The Next.js app is already configured to use the Python service. Just make sure:

1. Python service is running on `http://localhost:5000`
2. Next.js app is running (usually `http://localhost:3000` or `3001`)
3. Upload an image in the "Scan MCQ" page

## Production Deployment

For production, use a proper WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Or use Docker, systemd service, or cloud platforms like Heroku, Railway, etc.

## Alternative: Using OpenAI (Optional)

If you prefer to use OpenAI instead:

1. Get OpenAI API key
2. Add to `.env.local`: `OPENAI_API_KEY=sk-your-key`
3. Update `app/api/scan/route.ts` to use OpenAI instead

The Python OCR service is free and doesn't require API keys!

