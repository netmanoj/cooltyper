import React from 'react';

interface TimerProps {
  time: number;
  isActive: boolean;
  isDarkTheme: boolean;
  themes: {
    dark: {
      text: string;
      primary: string;
    };
    light: {
      text: string;
    };
  };
}

const Timer: React.FC<TimerProps> = ({ time, isActive, isDarkTheme, themes }) => {
  return (
    <div 
      className={`text-3xl sm:text-4xl font-mono mb-8 text-center transition-colors ${
        isActive ? 'text-[#e2b714]' : ''
      }`}
      style={{ 
        color: isActive ? themes.dark.primary : (isDarkTheme ? themes.dark.text : themes.light.text)
      }}
    >
      {time}s
    </div>
  );
};

export default Timer; 