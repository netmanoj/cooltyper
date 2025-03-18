'use client';

import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChartBarIcon, ClockIcon, CheckCircleIcon, FireIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TypingTest {
  id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  duration: number;
  characters: number;
  errors: number;
  created_at: string;
}

interface Stats {
  totalTests: number;
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  totalCharacters: number;
  totalErrors: number;
  totalTime: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<TypingTest[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    averageWPM: 0,
    bestWPM: 0,
    averageAccuracy: 0,
    totalCharacters: 0,
    totalErrors: 0,
    totalTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTypingData() {
      if (!user) return;

      try {
        const { data: resultsData, error: resultsError } = await supabase
          .from('typing_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (resultsError) throw resultsError;

        const allTests = resultsData || [];
        setTests(allTests);

        if (allTests.length > 0) {
          const totalTests = allTests.length;
          const avgWPM = Math.round(allTests.reduce((sum, test) => sum + test.wpm, 0) / totalTests);
          const bestWPM = Math.max(...allTests.map(test => test.wpm));
          const avgAccuracy = Math.round(allTests.reduce((sum, test) => sum + test.accuracy, 0) / totalTests);
          const totalChars = allTests.reduce((sum, test) => sum + (test.characters || 0), 0);
          const totalErrors = allTests.reduce((sum, test) => sum + (test.errors || 0), 0);
          const totalTime = allTests.reduce((sum, test) => sum + (test.duration || 0), 0);

          setStats({
            totalTests,
            averageWPM: avgWPM,
            bestWPM: bestWPM,
            averageAccuracy: avgAccuracy,
            totalCharacters: totalChars,
            totalErrors: totalErrors,
            totalTime: totalTime
          });
        }
      } catch (error) {
        console.error('Error fetching typing data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTypingData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Please sign in to view your profile</h1>
          <Link href="/auth" className="text-yellow-500 hover:text-yellow-400">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getRankColor = (wpm: number) => {
    if (wpm >= 60) return 'bg-yellow-500';
    if (wpm >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getRankTitle = (wpm: number) => {
    if (wpm >= 60) return 'Pro';
    if (wpm >= 40) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Test</span>
        </button>

        {/* Profile Header */}
        <div className="bg-[#262626] rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{user.email}</h1>
              <p className="text-gray-400">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 ${getRankColor(stats.averageWPM)} text-black rounded-full font-medium transition-colors`}>
                {getRankTitle(stats.averageWPM)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#262626] rounded-2xl p-6 shadow-lg hover:bg-[#2a2a2a] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-200">Average WPM</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.averageWPM}</p>
          </div>
          <div className="bg-[#262626] rounded-2xl p-6 shadow-lg hover:bg-[#2a2a2a] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <FireIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-200">Best WPM</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.bestWPM}</p>
          </div>
          <div className="bg-[#262626] rounded-2xl p-6 shadow-lg hover:bg-[#2a2a2a] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircleIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-200">Accuracy</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.averageAccuracy}%</p>
          </div>
          <div className="bg-[#262626] rounded-2xl p-6 shadow-lg hover:bg-[#2a2a2a] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <ClockIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-200">Tests Taken</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalTests}</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-[#262626] rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Detailed Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 bg-[#2a2a2a] rounded-xl">
              <p className="text-gray-400 mb-1">Total Characters Typed</p>
              <p className="text-2xl font-bold text-white">{stats.totalCharacters.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#2a2a2a] rounded-xl">
              <p className="text-gray-400 mb-1">Total Time Typing</p>
              <p className="text-2xl font-bold text-white">{Math.round(stats.totalTime)} seconds</p>
            </div>
            <div className="p-4 bg-[#2a2a2a] rounded-xl">
              <p className="text-gray-400 mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalCharacters ? ((stats.totalErrors / stats.totalCharacters) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-[#262626] rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Recent Tests</h2>
          {tests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No typing tests completed yet.</p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Start Your First Test
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3 font-medium">WPM</th>
                    <th className="pb-3 font-medium">Accuracy</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {tests.slice(0, 10).map((test) => (
                    <tr key={test.id} className="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                      <td className="py-3">
                        <span className="font-medium text-yellow-500">{test.wpm}</span>
                      </td>
                      <td className="py-3">{test.accuracy}%</td>
                      <td className="py-3">{test.duration}s</td>
                      <td className="py-3">{new Date(test.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 