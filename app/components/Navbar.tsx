'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, DocumentTextIcon, ChatBubbleLeftIcon, BeakerIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onModeChange: (mode: 'time' | 'words' | 'quote' | 'custom') => void;
  onTimeChange: (time: number) => void;
  onWordCountChange: (count: number) => void;
  isDarkTheme: boolean;
  onThemeToggle: () => void;
  currentMode: 'time' | 'words' | 'quote' | 'custom';
  themes: any;
}

export default function Navbar({
  onModeChange,
  onTimeChange,
  onWordCountChange,
  isDarkTheme,
  onThemeToggle,
  currentMode,
  themes,
}: NavbarProps) {
  const { user, signOut } = useAuth();
  const [selectedTime, setSelectedTime] = useState(30);
  const router = useRouter();

  useEffect(() => {
    console.log('Navbar - User state:', user ? 'logged in' : 'not logged in');
  }, [user]);

  return (
    <nav className="w-full py-4 px-2 sm:px-4 bg-[#262626] rounded-lg mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <Link href="/" className="text-xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors">
            CoolTyper
          </Link>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onModeChange('time')}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'time' ? 'text-yellow-500 bg-[#303030]' : 'text-gray-400 bg-[#262626] hover:bg-[#303030]'
              }`}
            >
              <ClockIcon className="w-4 h-4 mr-1.5" />
              time
            </button>

            <button
              onClick={() => onModeChange('words')}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'words' ? 'text-yellow-500 bg-[#303030]' : 'text-gray-400 bg-[#262626] hover:bg-[#303030]'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4 mr-1.5" />
              words
            </button>

            <button
              onClick={() => onModeChange('quote')}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'quote' ? 'text-yellow-500 bg-[#303030]' : 'text-gray-400 bg-[#262626] hover:bg-[#303030]'
              }`}
            >
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1.5" />
              quote
            </button>

            <button
              onClick={() => onModeChange('custom')}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'custom' ? 'text-yellow-500 bg-[#303030]' : 'text-gray-400 bg-[#262626] hover:bg-[#303030]'
              }`}
            >
              <BeakerIcon className="w-4 h-4 mr-1.5" />
              custom
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg text-gray-400 transition-colors bg-[#303030] hover:bg-[#404040]"
          >
            {isDarkTheme ? '🌞' : '🌙'}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm text-gray-400 bg-[#303030]">
                <UserCircleIcon className="w-4 h-4 mr-1.5" />
                {user.email?.split('@')[0]}
              </div>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    router.push('/auth');
                  } catch (error) {
                    console.error('Sign out error:', error);
                  }
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm text-gray-400 transition-colors bg-[#303030] hover:bg-[#404040]"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm text-gray-400 transition-colors bg-[#303030] hover:bg-[#404040]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Time Controls */}
      {currentMode === 'time' && (
        <div className="mt-4">
          <div className="flex justify-center sm:justify-start gap-2 mb-2">
            {[15, 30, 60, 120].map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time);
                  onTimeChange(time);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedTime === time ? 'text-yellow-500 bg-[#303030]' : 'text-gray-400 bg-[#262626] hover:bg-[#303030]'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="w-full h-1 bg-[#303030] rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-100"
              style={{ width: `${(selectedTime / 120) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Word Count Controls */}
      {currentMode === 'words' && (
        <div className="mt-4">
          <div className="flex justify-center sm:justify-start gap-2 mb-2">
            {[10, 25, 50, 100].map((count) => (
              <button
                key={count}
                onClick={() => onWordCountChange(count)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedTime === count ? 'text-yellow-500 bg-[#303030]' : 'text-gray-400 bg-[#262626] hover:bg-[#303030]'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <div className="w-full h-1 bg-[#303030] rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-100"
              style={{ width: `${(selectedTime / 100) * 100}%` }}
            />
          </div>
        </div>
      )}
    </nav>
  );
} 