'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

interface ExamResult {
  _id: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  completedAt: string;
}

export default function ExamResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchResult();
    }
  }, [examId]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(`/api/exam?id=${examId}`);
      setResult(response.data.exam);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading results...</div>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout>
        <div className="p-8">Result not found</div>
      </DashboardLayout>
    );
  }

  const correctPercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const wrongPercentage = Math.round((result.wrongAnswers / result.totalQuestions) * 100);
  const unansweredPercentage = Math.round((result.unanswered / result.totalQuestions) * 100);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Results</h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">{Math.round(result.score)}%</div>
            <p className="text-gray-600">Your Score</p>
          </div>

          <div className="flex items-center justify-center w-64 h-64 mx-auto mb-6 relative">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              <circle
                cx="128"
                cy="128"
                r="100"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${correctPercentage * 6.28} 628`}
                strokeLinecap="round"
              />
              <circle
                cx="128"
                cy="128"
                r="100"
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeDasharray={`${wrongPercentage * 6.28} 628`}
                strokeDashoffset={`-${correctPercentage * 6.28}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{correctPercentage}%</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Correct Answers</span>
              </div>
              <span className="text-xl font-bold text-green-600">{result.correctAnswers}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Wrong Answers</span>
              </div>
              <span className="text-xl font-bold text-red-600">{result.wrongAnswers}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Unanswered</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">{result.unanswered}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-700">Total Questions</span>
              <span className="text-xl font-bold text-blue-600">{result.totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/dashboard/exam')}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start New Exam
          </button>
          <button
            onClick={() => router.push('/dashboard/analytics')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
