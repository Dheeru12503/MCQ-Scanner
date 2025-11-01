'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';

interface Exam {
  _id: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  completedAt: string;
  subject?: string;
  topic?: string;
}

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exam');
      const completedExams = response.data.exams.filter((exam: Exam) => exam.completedAt);
      setExams(completedExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading analytics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics & Reports</h1>

        {exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No exam results available yet.</p>
            <a
              href="/dashboard/exam"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Start Your First Exam
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Exams</h3>
                <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Average Score</h3>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(exams.reduce((acc, exam) => acc + exam.score, 0) / exams.length)}%
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Questions</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {exams.reduce((acc, exam) => acc + exam.totalQuestions, 0)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Correct Answers</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {exams.reduce((acc, exam) => acc + exam.correctAnswers, 0)}
                </p>
              </div>
            </div>

            {/* Exam History Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Exam Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Topic</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Correct</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Wrong</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr key={exam._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(exam.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{exam.subject || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-700">{exam.topic || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-700">{exam.totalQuestions}</td>
                        <td className="py-3 px-4 text-green-600 font-semibold">
                          {exam.correctAnswers}
                        </td>
                        <td className="py-3 px-4 text-red-600 font-semibold">
                          {exam.wrongAnswers}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              exam.score >= 70
                                ? 'text-green-600'
                                : exam.score >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {Math.round(exam.score)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
