'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function HistoryButton() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex justify-center mt-8 mb-4">
      <Link
        href="/profile"
        className="inline-flex items-center px-6 py-3 text-base font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-md transition-colors duration-200"
      >
        <ChartBarIcon className="w-5 h-5 mr-2" />
        View Previous Test Results
      </Link>
    </div>
  );
} 