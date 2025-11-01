'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  subject?: string;
  topic?: string;
}

export default function ScanMCQPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedMCQs, setExtractedMCQs] = useState<MCQ[] | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setExtractedMCQs(null);
      setMessage('');
    }
  };

  const handleScan = async () => {
    if (!file) {
      setMessage('Please select an image file');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExtractedMCQs(response.data.mcqs);
      setMessage(`Successfully extracted ${response.data.mcqs.length} MCQ(s)!`);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to scan image');
      setExtractedMCQs(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMCQs = async () => {
    if (!extractedMCQs || extractedMCQs.length === 0) return;

    setLoading(true);
    try {
      await axios.post('/api/mcq', extractedMCQs);
      setMessage('MCQs saved successfully!');
      setExtractedMCQs(null);
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to save MCQs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Scan MCQ from Image</h1>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JPG, PNG, GIF. The image should contain clear MCQs.
            </p>
          </div>

          {preview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {preview && !extractedMCQs && (
            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Scanning with AI...' : 'Scan Image with AI'}
            </button>
          )}

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes('Successfully') || message.includes('successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {extractedMCQs && extractedMCQs.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Extracted MCQs ({extractedMCQs.length})
                </h2>
                <button
                  onClick={handleSaveMCQs}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save All MCQs'}
                </button>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {extractedMCQs.map((mcq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-blue-600">
                        Question {index + 1}:
                      </span>
                      <p className="mt-1 text-gray-800">{mcq.question}</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-gray-700">Options:</span>
                      <ul className="mt-1 space-y-1">
                        {mcq.options.map((option, optIndex) => (
                          <li
                            key={optIndex}
                            className={`pl-4 ${
                              optIndex === mcq.correctAnswer
                                ? 'text-green-700 font-semibold'
                                : 'text-gray-600'
                            }`}
                          >
                            {optIndex === mcq.correctAnswer && '✓ '}
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {mcq.subject && (
                      <p className="text-sm text-gray-500">
                        Subject: {mcq.subject} {mcq.topic && `• Topic: ${mcq.topic}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
