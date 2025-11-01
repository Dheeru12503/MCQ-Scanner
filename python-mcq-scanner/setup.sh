#!/bin/bash
echo "Setting up Python MCQ Scanner..."
echo

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo
echo "Setup complete!"
echo
echo "To start the service, run: ./start.sh"
echo "Or manually: python3 app.py"

