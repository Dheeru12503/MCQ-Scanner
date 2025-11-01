'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AddMCQPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: '',
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer: formData.correctAnswer >= newOptions.length ? 0 : formData.correctAnswer,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate form
    if (!formData.question.trim()) {
      setMessage('Please enter a question');
      setLoading(false);
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setMessage('Please provide at least 2 options');
      setLoading(false);
      return;
    }

    if (formData.correctAnswer < 0 || formData.correctAnswer >= validOptions.length) {
      setMessage('Please select a valid correct answer');
      setLoading(false);
      return;
    }

    try {
      // Adjust correctAnswer index if some options were empty
      const optionIndexMap: number[] = [];
      let newCorrectAnswer = 0;
      formData.options.forEach((opt, idx) => {
        if (opt.trim()) {
          optionIndexMap.push(idx);
          if (idx === formData.correctAnswer) {
            newCorrectAnswer = optionIndexMap.length - 1;
          }
        }
      });

      const mcqData = {
        question: formData.question.trim(),
        options: validOptions,
        correctAnswer: newCorrectAnswer,
        subject: formData.subject.trim() || undefined,
        topic: formData.topic.trim() || undefined,
        difficulty: formData.difficulty,
      };

      await axios.post('/api/mcq', mcqData);
      setMessage('MCQ added successfully!');
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        subject: '',
        topic: '',
        difficulty: 'medium',
      });
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to add MCQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add MCQ Manually</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <textarea
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter your question here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + Add Option
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Algebra"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes('successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add MCQ'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
