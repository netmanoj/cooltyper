'use client';

import { useState } from 'react';
import { ClockIcon, DocumentTextIcon, ChatBubbleLeftIcon, BeakerIcon } from '@heroicons/react/24/outline';

const testModes = [
  { id: 'time', icon: ClockIcon, label: 'time' },
  { id: 'words', icon: DocumentTextIcon, label: 'words' },
  { id: 'quote', icon: ChatBubbleLeftIcon, label: 'quote' },
  { id: 'custom', icon: BeakerIcon, label: 'custom' },
];

interface NavbarProps {
  onModeChange: (mode: 'time' | 'words') => void;
  onTimeChange?: (time: number) => void;
  onWordCountChange?: (count: number) => void;
  isDarkTheme: boolean;
  onThemeToggle: () => void;
  currentMode: 'time' | 'words';
  themes: {
    dark: {
      background: string;
      text: string;
      textDark: string;
      primary: string;
      containerBg: string;
    };
    light: {
      background: string;
      text: string;
      textDark: string;
      containerBg: string;
    };
  };
}

export default function Navbar({ 
  onModeChange, 
  onTimeChange, 
  onWordCountChange, 
  isDarkTheme, 
  onThemeToggle,
  themes 
}: NavbarProps) {
  const [selectedMode, setSelectedMode] = useState('time');
  const [selectedTime, setSelectedTime] = useState(30);
  const [selectedWordCount, setSelectedWordCount] = useState(25);

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    onModeChange(mode as 'time' | 'words');
  };

  const currentTheme = isDarkTheme ? themes.dark : themes.light;

  return (
    <nav className="w-full p-2 sm:p-4 mb-4 sm:mb-8 overflow-x-auto" style={{ backgroundColor: currentTheme.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 min-w-max">
            <h1 className="text-xl sm:text-2xl font-bold px-2 sm:px-0" style={{ color: themes.dark.primary }}>CoolType</h1>
            
            <div className="flex items-center space-x-2 sm:space-x-4 px-2 sm:px-0">
              {testModes.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleModeChange(id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md transition-colors text-sm sm:text-base ${
                    selectedMode === id
                      ? 'bg-opacity-50'
                      : 'hover:bg-opacity-50'
                  }`}
                  style={{ 
                    backgroundColor: currentTheme.containerBg,
                    color: selectedMode === id ? themes.dark.primary : currentTheme.textDark
                  }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {selectedMode === 'time' && (
              <div className="flex items-center space-x-2 px-2 sm:px-0">
                {[15, 30, 60, 120].map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      onTimeChange?.(time);
                    }}
                    className={`px-2 sm:px-3 py-1 rounded-md transition-colors text-sm sm:text-base ${
                      selectedTime === time
                        ? 'bg-opacity-50'
                        : 'hover:bg-opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: currentTheme.containerBg,
                      color: selectedTime === time ? themes.dark.primary : currentTheme.textDark
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}

            {selectedMode === 'words' && (
              <div className="flex items-center space-x-2 px-2 sm:px-0">
                {[10, 25, 50, 100].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setSelectedWordCount(count);
                      onWordCountChange?.(count);
                    }}
                    className={`px-2 sm:px-3 py-1 rounded-md transition-colors text-sm sm:text-base ${
                      selectedWordCount === count
                        ? 'bg-opacity-50'
                        : 'hover:bg-opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: currentTheme.containerBg,
                      color: selectedWordCount === count ? themes.dark.primary : currentTheme.textDark
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg transition-all hidden sm:block"
            style={{ color: currentTheme.text }}
          >
            {isDarkTheme ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
} 