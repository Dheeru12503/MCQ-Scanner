# Python MCQ Scanner API

A Python-based OCR service for extracting Multiple Choice Questions (MCQs) from images.

## Features

- **OCR Extraction**: Uses EasyOCR and Tesseract for text extraction
- **Image Preprocessing**: Automatic image enhancement for better OCR results
- **Smart Parsing**: Automatically detects and parses MCQs from extracted text
- **RESTful API**: Easy integration with Next.js frontend

## Installation

### Prerequisites

1. **Python 3.8+** installed
2. **Tesseract OCR** (optional, for alternative OCR method)
   - Windows: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - macOS: `brew install tesseract`
   - Linux: `sudo apt-get install tesseract-ocr`

### Setup

1. **Navigate to the Python scanner directory:**
   ```bash
   cd python-mcq-scanner
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Note:** EasyOCR will download models on first run (requires internet connection)

## Running the Service

```bash
python app.py
```

The API will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Scan Image
```
POST /scan
Content-Type: multipart/form-data
Body: image file
```

### Scan Base64 Image
```
POST /scan-base64
Content-Type: application/json
Body: { "image": "base64_encoded_string" }
```

## Integration with Next.js

Update your Next.js API route to call the Python service:

```javascript
// In app/api/scan/route.ts
const formData = new FormData();
formData.append('image', file);

const response = await fetch('http://localhost:5000/scan', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

## Configuration

You can configure the service in `app.py`:
- Change OCR method (EasyOCR vs Tesseract)
- Adjust image preprocessing
- Modify parsing patterns

## Troubleshooting

1. **EasyOCR download is slow**: First run downloads models (~500MB). Subsequent runs are fast.
2. **Tesseract not found**: Install Tesseract or set path in code:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```
3. **Poor OCR results**: Try image preprocessing or use higher resolution images

## Production Deployment

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

