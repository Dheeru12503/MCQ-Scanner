# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB running locally OR MongoDB Atlas account
- [ ] OpenAI API key (for image scanning feature)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/mcq-scanner
JWT_SECRET=your-super-secret-key-min-32-chars-long
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

**Important Notes:**
- For MongoDB Atlas: Replace `MONGODB_URI` with your Atlas connection string
- Generate a random `JWT_SECRET` (use at least 32 random characters)
- Get OpenAI API key from: https://platform.openai.com/api-keys

### 3. Start MongoDB (if using local MongoDB)
```bash
# On Windows
mongod

# On macOS/Linux
sudo mongod
```

Or use MongoDB Atlas (cloud) - no local setup needed!

### 4. Run Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to: http://localhost:3000

## First Time Usage

1. **Register Account**
   - You'll be redirected to login page
   - Click "Sign up" link
   - Enter username and password

2. **Add Your First MCQ**
   - Login with your credentials
   - Go to "Add MCQ" from sidebar
   - Fill in question, 2+ options, select correct answer
   - Click "Add MCQ"

3. **Start Your First Exam**
   - Go to "Start Exam" from sidebar
   - Select settings (subject, number of questions, time limit)
   - Click "Start Test →"
   - Answer questions and submit

4. **View Results**
   - After submitting exam, view your score
   - Check "Analytics" page for detailed reports

## Features Overview

### Manual MCQ Entry
- Navigate to "Add MCQ"
- Enter question, options, correct answer
- Add subject and topic for organization

### AI Image Scanning
- Navigate to "Scan MCQ"
- Upload an image containing MCQs
- AI will extract questions automatically
- Review and save extracted MCQs

### Taking Exams
- Navigate to "Start Exam"
- Customize exam settings
- Answer questions with timer
- Flag questions for review
- Submit when done

### Viewing Analytics
- Navigate to "Analytics"
- See all previous exam results
- View performance statistics
- Track progress over time

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running (check `mongod` process)
- Verify `MONGODB_URI` in `.env.local` is correct
- For Atlas: Check IP whitelist and credentials

### "OpenAI API Error"
- Verify API key is correct
- Check you have credits in OpenAI account
- Ensure GPT-4 Vision API access is enabled

### "Port 3000 already in use"
```bash
# Use a different port
PORT=3001 npm run dev
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Next Steps

- Add more MCQs manually or via scanning
- Create exams with different subjects/topics
- Track your performance in Analytics
- Customize the UI to your preferences

Happy studying! 🎓
