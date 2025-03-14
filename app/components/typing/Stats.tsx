'use client';

import React from 'react';

interface StatsProps {
  wpm: number;
  accuracy: number;
  errors: number;
  characters: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  time: number;
  speedData: Array<{ time: number; wpm: number; raw: number }>;
  themes: {
    dark: {
      text: string;
      textDark: string;
      primary: string;
      containerBg: string;
    };
    light: {
      text: string;
      textDark: string;
      primary: string;
      containerBg: string;
    };
  };
  isDarkTheme: boolean;
  isTestComplete: boolean;
  isActive: boolean;
}

export default function Stats({ 
  wpm, 
  accuracy,
  errors,
  characters, 
  time,
  isDarkTheme,
  themes,
  isTestComplete,
  isActive
}: StatsProps) {
  const currentTheme = isDarkTheme ? themes.dark : themes.light;

  const cpm = time > 0 
    ? Math.round((characters.correct + characters.incorrect) / (time / 60)) 
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
      {/* WPM */}
      <div 
        className="flex flex-col items-center p-5 rounded-xl" 
        style={{ backgroundColor: currentTheme.containerBg }}
      >
        <span 
          className="text-4xl sm:text-5xl font-bold" 
          style={{ color: currentTheme.primary }}
        >
          {wpm}
        </span>
        <span 
          className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-3" 
          style={{ color: currentTheme.textDark }}
        >
          WPM
        </span>
      </div>

      {/* Accuracy */}
      <div 
        className="flex flex-col items-center p-5 rounded-xl" 
        style={{ backgroundColor: currentTheme.containerBg }}
      >
        <span 
          className="text-4xl sm:text-5xl font-bold" 
          style={{ color: currentTheme.primary }}
        >
          {accuracy}%
        </span>
        <span 
          className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-3" 
          style={{ color: currentTheme.textDark }}
        >
          Accuracy
        </span>
      </div>

      {/* Characters */}
      <div 
        className="flex flex-col items-center p-5 rounded-xl" 
        style={{ backgroundColor: currentTheme.containerBg }}
      >
        <span 
          className="text-4xl sm:text-5xl font-bold" 
          style={{ color: currentTheme.primary }}
        >
          {characters.correct}
        </span>
        <span 
          className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-3" 
          style={{ color: currentTheme.textDark }}
        >
          Characters
        </span>
        <span 
          className="text-[11px] mt-2 opacity-75 text-center" 
          style={{ color: currentTheme.textDark }}
        >
          {errors} error{errors !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Time */}
      <div 
        className="flex flex-col items-center p-5 rounded-xl" 
        style={{ backgroundColor: currentTheme.containerBg }}
      >
        <span 
          className="text-4xl sm:text-5xl font-bold" 
          style={{ color: currentTheme.primary }}
        >
          {time}s
        </span>
        <span 
          className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-3" 
          style={{ color: currentTheme.textDark }}
        >
          Time
        </span>
        <span 
          className="text-[11px] mt-2 opacity-75 text-center" 
          style={{ color: currentTheme.textDark }}
        >
          {cpm} CPM
        </span>
      </div>
    </div>
  );
}
