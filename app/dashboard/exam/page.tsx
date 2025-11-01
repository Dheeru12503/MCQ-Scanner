'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ExamSetupPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    questionCount: 10,
    timeLimit: 60,
    includeAttempted: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubjectsAndTopics();
  }, []);

  const fetchSubjectsAndTopics = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      if (response.data.subjects) setSubjects(response.data.subjects);
      if (response.data.topics) setTopics(response.data.topics);
    } catch (error) {
      console.error('Error fetching subjects/topics:', error);
    }
  };

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/exam', formData);
      router.push(`/dashboard/exam/take?id=${response.data.exam._id}`);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Start Exam</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose Your Test Settings</h2>

          <form onSubmit={handleStartExam} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose the Subject
              </label>
              <div className="flex flex-wrap gap-3">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setFormData({ ...formData, subject })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.subject === subject
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subject}
                    </button>
                  ))
                ) : (
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subject"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic (Optional)
              </label>
              {topics.length > 0 ? (
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Topics</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter topic (optional)"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.questionCount}
                  onChange={(e) =>
                    setFormData({ ...formData, questionCount: parseInt(e.target.value) || 10 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 60 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAttempted"
                checked={formData.includeAttempted}
                onChange={(e) =>
                  setFormData({ ...formData, includeAttempted: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="includeAttempted" className="ml-2 text-sm text-gray-700">
                Include previously attempted questions
              </label>
            </div>

            {message && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? 'Starting Exam...' : 'Start Test →'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
