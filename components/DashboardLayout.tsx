'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Fetch user info
    axiosInstance.get('/api/auth/me')
      .then((response) => {
        if (response.data.user) {
          setUsername(response.data.user.username);
        }
      })
      .catch(() => {
        // If fails, user might not be logged in
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Add MCQ', path: '/dashboard/add-mcq', icon: '➕' },
    { name: 'Scan MCQ', path: '/dashboard/scan-mcq', icon: '📷' },
    { name: 'Start Exam', path: '/dashboard/exam', icon: '📝' },
    { name: 'Analytics', path: '/dashboard/analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">MCQ Scanner</h1>
              <p className="hidden md:block text-sm text-gray-600">
                Confidence comes with practice. Let's upgrade and win the battle
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                UPGRADE
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  <span className="text-gray-700 font-medium">{username || 'User'}</span>
                  <span className="text-gray-500">▼</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <nav className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex flex-col items-center justify-center space-y-1 px-2 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
