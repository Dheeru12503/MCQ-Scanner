from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import cv2
import numpy as np
import re
import io
import base64
import easyocr

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize EasyOCR reader (only once for better performance)
easyocr_reader = easyocr.Reader(['en'])

def preprocess_image(image_bytes):
    """Preprocess image for better OCR results"""
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Noise removal
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    return denoised

def extract_text_with_ocr(image_bytes, use_easyocr=True):
    """Extract text from image using OCR"""
    try:
        if use_easyocr:
            # Use EasyOCR (more accurate but slower)
            image = Image.open(io.BytesIO(image_bytes))
            result = easyocr_reader.readtext(np.array(image))
            text = ' '.join([item[1] for item in result])
        else:
            # Use Tesseract (faster but less accurate)
            processed_img = preprocess_image(image_bytes)
            text = pytesseract.image_to_string(processed_img, lang='eng')
        
        return text
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return None

def parse_mcqs_from_text(text):
    """Parse MCQs from extracted text"""
    mcqs = []
    
    # Pattern to match question numbers (1., 1), Q1, Question 1, etc.)
    question_pattern = r'(?i)(?:^|\n)(?:(?:q(?:uestion)?\s*)?(\d+)[\.\)]|(\d+)[\.\)])\s*(.+?)(?=\n(?:q(?:uestion)?\s*)?\d+[\.\)]|\n(?:a\)|b\)|c\)|d\)|\(a\)|\(b\)|\(c\)|\(d\)|^[a-d]\)|^[a-d][\.\)])|$)'
    
    # Pattern to match options (A), B), C), D) or a) b) c) d)
    option_pattern = r'(?:^|\n)(?:[\(\)]*([a-dA-D])[\)\.]\s*)(.+?)(?=\n(?:[\(\)]*[a-dA-D][\)\.]|$))'
    
    # Split text into potential questions
    # Look for common MCQ patterns
    questions = re.split(r'(?i)(?:question\s*\d+|q\s*\d+|\n\s*\d+[\.\)])', text)
    
    for i, question_block in enumerate(questions[1:], 1):  # Skip first empty split
        if not question_block.strip():
            continue
            
        # Try to extract question and options
        lines = question_block.strip().split('\n')
        question_text = ""
        options = []
        
        # Find question text (usually comes before options)
        question_started = False
        option_letters = ['a', 'b', 'c', 'd', 'e']
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if this line is an option
            option_match = re.match(r'^([a-eA-E])[\)\.]\s*(.+)', line, re.IGNORECASE)
            if option_match:
                option_letter = option_match.group(1).lower()
                option_text = option_match.group(2).strip()
                options.append(option_text)
            else:
                # If we haven't started collecting options, this is part of question
                if not options:
                    if question_text:
                        question_text += " " + line
                    else:
                        question_text = line
                elif line.lower().startswith(('correct', 'answer', 'ans')):
                    # This might indicate the correct answer
                    # Extract option letter if mentioned
                    ans_match = re.search(r'([a-eA-E])', line, re.IGNORECASE)
                    if ans_match:
                        # We'll handle this later
                        pass
        
        # Clean up question text
        question_text = re.sub(r'^\d+[\.\)]\s*', '', question_text).strip()
        
        # Only create MCQ if we have at least question and 2 options
        if question_text and len(options) >= 2:
            # Default correct answer to first option (user can correct later)
            mcqs.append({
                "question": question_text,
                "options": options[:6],  # Limit to 6 options max
                "correctAnswer": 0,  # Default to first option
                "subject": "",
                "topic": ""
            })
    
    # Alternative simpler parsing if above doesn't work well
    if not mcqs:
        mcqs = simple_parse_mcqs(text)
    
    return mcqs

def simple_parse_mcqs(text):
    """Simpler parsing method for MCQs"""
    mcqs = []
    
    # Split by common separators
    sections = re.split(r'(?i)(?:question\s*\d+|q\s*\d+|\n\s*\d+[\.\)]\s*)', text)
    
    for section in sections:
        if not section.strip():
            continue
        
        lines = [l.strip() for l in section.split('\n') if l.strip()]
        if len(lines) < 3:  # Need at least question + 2 options
            continue
        
        # First line or few lines are question
        question_parts = []
        options = []
        i = 0
        
        # Collect question
        while i < len(lines) and not re.match(r'^[a-eA-E][\)\.]', lines[i]):
            question_parts.append(lines[i])
            i += 1
        
        question = ' '.join(question_parts).strip()
        question = re.sub(r'^\d+[\.\)]\s*', '', question)  # Remove question number
        
        # Collect options
        while i < len(lines):
            option_match = re.match(r'^([a-eA-E])[\)\.]\s*(.+)', lines[i], re.IGNORECASE)
            if option_match:
                options.append(option_match.group(2).strip())
            i += 1
        
        if question and len(options) >= 2:
            mcqs.append({
                "question": question,
                "options": options[:6],
                "correctAnswer": 0,
                "subject": "",
                "topic": ""
            })
    
    return mcqs

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "MCQ Scanner"})

@app.route('/scan', methods=['POST'])
def scan_image():
    """Extract MCQs from uploaded image"""
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        # Read image bytes
        image_bytes = file.read()
        
        # Extract text using OCR
        print("Extracting text from image...")
        text = extract_text_with_ocr(image_bytes, use_easyocr=True)
        
        if not text:
            return jsonify({"error": "Failed to extract text from image"}), 500
        
        print(f"Extracted text:\n{text[:500]}...")  # Print first 500 chars for debugging
        
        # Parse MCQs from text
        print("Parsing MCQs from text...")
        mcqs = parse_mcqs_from_text(text)
        
        if not mcqs:
            # If parsing fails, return the raw text so user can see what was extracted
            return jsonify({
                "error": "Could not automatically parse MCQs from image. Please try manual entry.",
                "extracted_text": text,
                "mcqs": []
            }), 200
        
        print(f"Found {len(mcqs)} MCQs")
        
        return jsonify({
            "message": f"Successfully extracted {len(mcqs)} MCQ(s)",
            "mcqs": mcqs,
            "extracted_text": text  # Include for debugging
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to scan image: {str(e)}"}), 500

@app.route('/scan-base64', methods=['POST'])
def scan_base64():
    """Extract MCQs from base64 encoded image (for direct API calls)"""
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Extract text
        text = extract_text_with_ocr(image_bytes, use_easyocr=True)
        
        if not text:
            return jsonify({"error": "Failed to extract text from image"}), 500
        
        # Parse MCQs
        mcqs = parse_mcqs_from_text(text)
        
        if not mcqs:
            return jsonify({
                "error": "Could not automatically parse MCQs from image",
                "extracted_text": text,
                "mcqs": []
            }), 200
        
        return jsonify({
            "message": f"Successfully extracted {len(mcqs)} MCQ(s)",
            "mcqs": mcqs
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to scan image: {str(e)}"}), 500

if __name__ == '__main__':
    print("Starting MCQ Scanner API...")
    print("Make sure Tesseract is installed if you want to use it")
    print("EasyOCR will download models on first run")
    app.run(host='0.0.0.0', port=5000, debug=True)

