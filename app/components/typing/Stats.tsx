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
      containerBg: string;
    };
  };
  isDarkTheme: boolean;
}

export default function Stats({ 
  wpm, 
  accuracy,
  errors,
  characters, 
  time,
  isDarkTheme,
  themes 
}: StatsProps) {
  const currentTheme = isDarkTheme ? themes.dark : themes.light;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
      {/* WPM */}
      <div className="flex flex-col items-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.containerBg }}>
        <span className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: themes.dark.primary }}>
          {wpm}
        </span>
        <span className="text-xs sm:text-sm uppercase tracking-wider font-medium" style={{ color: currentTheme.textDark }}>
          wpm
        </span>
      </div>

      {/* Accuracy */}
      <div className="flex flex-col items-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.containerBg }}>
        <span className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: themes.dark.primary }}>
          {accuracy}%
        </span>
        <span className="text-xs sm:text-sm uppercase tracking-wider font-medium" style={{ color: currentTheme.textDark }}>
          acc
        </span>
      </div>

      {/* Errors */}
      <div className="flex flex-col items-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.containerBg }}>
        <span className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: themes.dark.primary }}>
          {errors}
        </span>
        <span className="text-xs sm:text-sm uppercase tracking-wider font-medium" style={{ color: currentTheme.textDark }}>
          errors
        </span>
      </div>

      {/* Time */}
      <div className="flex flex-col items-center p-4 rounded-xl" style={{ backgroundColor: currentTheme.containerBg }}>
        <span className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: themes.dark.primary }}>
          {time}s
        </span>
        <span className="text-xs sm:text-sm uppercase tracking-wider font-medium" style={{ color: currentTheme.textDark }}>
          time
        </span>
      </div>
    </div>
  );
}

 