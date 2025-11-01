'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

interface MCQ {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Exam {
  _id: string;
  questions: string[];
  timeLimit: number;
  startedAt: string;
  answers: { [key: string]: number };
}

export default function TakeExamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examId]);

  useEffect(() => {
    if (exam && !submitted) {
      // Calculate time remaining
      const startTime = new Date(exam.startedAt).getTime();
      const timeLimitMs = exam.timeLimit * 60 * 1000;
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, timeLimitMs - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0 && !submitted) {
          handleSubmitExam();
        }
      };

      updateTimer();
      intervalRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [exam, submitted]);

  const fetchExamData = async () => {
    try {
      const response = await axios.get(`/api/exam?id=${examId}`);
      const examData = response.data.exam;
      setExam(examData);
      setAnswers(examData.answers || {});

      // Fetch question details
      const questionIds = examData.questions;
      const questionsResponse = await axios.get('/api/mcq', {
        params: { ids: questionIds.join(',') },
      });

      // Questions are already filtered by API
      setQuestions(questionsResponse.data.mcqs);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: string, answerIndex: number) => {
    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);
    
    // Auto-save answers
    try {
      await axios.put('/api/exam', {
        examId,
        answers: newAnswers,
      });
    } catch (error) {
      console.error('Error auto-saving answers:', error);
    }
  };

  const handleFlagQuestion = (index: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(index)) {
      newFlagged.delete(index);
    } else {
      newFlagged.add(index);
    }
    setFlaggedQuestions(newFlagged);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSubmitExam = async () => {
    if (submitted) return;

    try {
      await axios.put('/api/exam', {
        examId,
        answers,
        completed: true,
      });
      setSubmitted(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      router.push(`/dashboard/exam/result?id=${examId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading exam...</div>
      </DashboardLayout>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8">Exam not found</div>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">MCQ Exam</h1>
          <p className="text-sm text-gray-600">
            Click on Flag option to pin the question to UNSOLVED chart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Question Navigation (Desktop) */}
          <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-md p-4 h-fit">
            <h2 className="font-semibold text-gray-800 mb-4">Unsolved</h2>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q._id] !== undefined;
                const isFlagged = flaggedQuestions.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : isFlagged
                        ? 'bg-red-500 text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentQuestionIndex(questions.length - 1)}
              className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
            >
              Jump to last
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-6">
            {/* Timer (Top) */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-red-600 font-semibold mb-1">Timer</h2>
                  <div className="text-2xl font-bold text-gray-800">
                    {formatTime(timeRemaining)} remaining
                  </div>
                  <p className="text-xs text-gray-500">Hours : Minutes : Seconds</p>
                </div>
                <div className="text-sm text-gray-600">
                  Answered: {answeredCount} / {questions.length}
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <div className="mb-4">
                <span className="text-lg font-semibold text-gray-700">
                  Question {currentQuestionIndex + 1}:
                </span>
              </div>
              <p className="text-gray-800 mb-6 text-lg">{currentQuestion.question}</p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      checked={answers[currentQuestion._id] === index}
                      onChange={() => handleAnswerChange(currentQuestion._id, index)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-800">{option}</span>
                  </label>
                ))}
              </div>

              {/* Flag Button */}
              <button
                onClick={() => handleFlagQuestion(currentQuestionIndex)}
                className={`mt-6 px-4 py-2 rounded-lg font-medium transition-colors ${
                  flaggedQuestions.has(currentQuestionIndex)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {flaggedQuestions.has(currentQuestionIndex) ? '✓ Flagged' : 'Flag'}
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() =>
                  setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Submit Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmitExam}
                disabled={submitted}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitted ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>

          {/* Right Sidebar - Timer (Desktop only, hidden on mobile) */}
          <aside className="hidden xl:block w-48 bg-white rounded-xl shadow-md p-4 h-fit">
            <h2 className="text-red-600 font-semibold mb-2">Timer</h2>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-xs text-gray-500 mb-4">Hours : Minutes : Seconds</p>
            <div className="text-sm text-gray-600">
              <p>Answered: {answeredCount}</p>
              <p>Total: {questions.length}</p>
            </div>
          </aside>
        </div>

        {/* Mobile Question Navigation */}
        <div className="lg:hidden mt-4 bg-white rounded-xl shadow-md p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Question Navigation</h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers[q._id] !== undefined;
              const isFlagged = flaggedQuestions.has(index);
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-full h-10 rounded-lg font-semibold text-sm transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : isFlagged
                      ? 'bg-red-500 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
