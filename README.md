# MCQ Scanner - Online Exam Platform

A full-stack MCQ (Multiple Choice Questions) scanner and exam platform built with Next.js, MongoDB, and AI-powered image extraction.

## Features

### For Students
- **User Authentication**: Secure login/signup system
- **Dashboard**: Comprehensive overview of performance metrics
- **MCQ Management**:
  - Manually add MCQs with question, options, correct answer, subject, and topic
  - AI-powered image scanning to extract MCQs from images
- **Exam System**:
  - Create exams with customizable settings (subject, topic, question count, time limit)
  - Responsive exam interface for desktop and mobile
  - Real-time timer
  - Question navigation with flagging system
  - Automatic scoring upon submission
- **Analytics**: View detailed reports of previous exam results

### Technical Features
- **AI Integration**: Python-based OCR service (EasyOCR/Tesseract) for MCQ extraction from images
- **Alternative AI**: Can use OpenAI Vision API (optional)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Secure Backend**: JWT-based authentication, protected API routes
- **Database**: MongoDB for storing users, MCQs, and exam results

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **OCR Service**: Python Flask API with EasyOCR/Tesseract (default)
- **Alternative AI**: OpenAI GPT-4 Vision API (optional)
- **Language**: TypeScript (Frontend), Python (OCR Service)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- Python 3.8+ installed (for OCR service)
- Optional: OpenAI API key (if using OpenAI instead of Python OCR)

### Installation

1. **Clone the repository**
   ```bash
   cd MCQ-Scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Python OCR Service**
   
   Navigate to the Python scanner directory and set it up:
   ```bash
   cd python-mcq-scanner
   
   # Windows
   setup.bat
   # Then start it
   start.bat
   
   # macOS/Linux
   chmod +x setup.sh start.sh
   ./setup.sh
   ./start.sh
   ```
   
   The Python service will run on `http://localhost:5000`

4. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mcq-scanner
   JWT_SECRET=your-very-secure-random-secret-key-here
   PYTHON_SERVICE_URL=http://localhost:5000
   # Optional: Only if using OpenAI instead of Python OCR
   # OPENAI_API_KEY=sk-your-openai-api-key
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas (cloud) and update the connection string in `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. **Register an account**
   - Go to the login page
   - Click "Sign up" if you don't have an account
   - Enter username and password

2. **Add MCQs**
   - Option 1: Manually add MCQs via "Add MCQ" page
   - Option 2: Upload an image with MCQs and use AI to extract them via "Scan MCQ" page

3. **Start an Exam**
   - Go to "Start Exam"
   - Select subject, topic (optional), number of questions, and time limit
   - Click "Start Test"

4. **View Results**
   - After completing an exam, view your score and detailed analytics
   - Check the "Analytics" page for all previous exam results

## Project Structure

```
MCQ-Scanner/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── mcq/          # MCQ management endpoints
│   │   ├── exam/         # Exam endpoints
│   │   ├── scan/         # AI image scanning endpoint
│   │   └── dashboard/    # Dashboard data endpoint
│   ├── dashboard/         # Dashboard pages
│   │   ├── add-mcq/      # Manual MCQ entry
│   │   ├── scan-mcq/     # AI image scanning
│   │   ├── exam/         # Exam pages
│   │   └── analytics/     # Analytics page
│   ├── login/             # Login/signup page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── DashboardLayout.tsx # Main dashboard layout
├── models/                # MongoDB models
│   ├── User.ts
│   ├── MCQ.ts
│   └── Exam.ts
├── lib/                   # Utility functions
│   ├── mongodb.ts         # Database connection
│   └── auth.ts            # Authentication utilities
├── middleware.ts          # Next.js middleware for route protection
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### MCQs
- `GET /api/mcq` - Get MCQs (supports filtering by subject, topic, or IDs)
- `POST /api/mcq` - Create MCQ(s)

### Exams
- `GET /api/exam` - Get exam(s)
- `POST /api/exam` - Create a new exam
- `PUT /api/exam` - Update exam (submit answers)

### AI Scanning
- `POST /api/scan` - Extract MCQs from uploaded image

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `OPENAI_API_KEY`: OpenAI API key for image scanning
- `NODE_ENV`: Environment (development/production)

## Production Deployment

1. Set `NODE_ENV=production` in your environment variables
2. Use a secure `JWT_SECRET` (at least 32 characters)
3. Configure your MongoDB Atlas connection string
4. Deploy to Vercel, Netlify, or your preferred hosting platform
5. Update environment variables in your hosting platform's dashboard

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or your Atlas connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas (if using cloud)

### OpenAI API Errors
- Verify your API key is correct in `.env.local`
- Ensure you have credits in your OpenAI account
- The scanning feature requires GPT-4 Vision API access

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
