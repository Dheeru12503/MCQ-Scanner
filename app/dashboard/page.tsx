'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';

interface DashboardStats {
  totalExams: number;
  completedExams: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  totalQuestions: number;
  accuracy: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/api/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  const correctPercentage = stats && stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;
  const wrongPercentage = stats && stats.totalQuestions > 0
    ? Math.round((stats.totalWrong / stats.totalQuestions) * 100)
    : 0;
  const unansweredPercentage = stats && stats.totalQuestions > 0
    ? Math.round((stats.totalUnanswered / stats.totalQuestions) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Overall Performance */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Performance</h2>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center justify-center w-48 h-48 mx-auto mb-4 relative">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray={`${correctPercentage * 5.02} 502`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeDasharray={`${wrongPercentage * 5.02} 502`}
                    strokeDashoffset={`-${correctPercentage * 5.02}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{correctPercentage}%</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">Correct answer</span>
                    <span className="text-sm font-semibold">{correctPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${correctPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">Wrong answer</span>
                    <span className="text-sm font-semibold">{wrongPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${wrongPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">Unanswered</span>
                    <span className="text-sm font-semibold">{unansweredPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${unansweredPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Tests Attempted</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalExams || 0}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.completedExams || 0} completed
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Questions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalQuestions || 0}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.totalCorrect || 0} correct answers
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Accuracy</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats ? Math.round(stats.accuracy) : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Overall performance</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/dashboard/add-mcq"
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-4 text-center transition-colors"
            >
              <div className="text-3xl mb-2">➕</div>
              <div className="font-semibold text-blue-700">Add MCQ Manually</div>
            </a>
            <a
              href="/dashboard/scan-mcq"
              className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg p-4 text-center transition-colors"
            >
              <div className="text-3xl mb-2">📷</div>
              <div className="font-semibold text-green-700">Scan MCQ from Image</div>
            </a>
            <a
              href="/dashboard/exam"
              className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg p-4 text-center transition-colors"
            >
              <div className="text-3xl mb-2">📝</div>
              <div className="font-semibold text-purple-700">Start Exam</div>
            </a>
            <a
              href="/dashboard/analytics"
              className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg p-4 text-center transition-colors"
            >
              <div className="text-3xl mb-2">📈</div>
              <div className="font-semibold text-orange-700">View Analytics</div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
