import React from 'react';

interface FontSizeControlProps {
  isTestComplete: boolean;
  isDarkTheme: boolean;
  fontSize: number;
  themes: {
    dark: {
      text: string;
      containerBg: string;
      primary: string;
    };
    light: {
      text: string;
      containerBg: string;
    };
  };
  onFontSizeChange: (newSize: number) => void;
}

const FontSizeControl: React.FC<FontSizeControlProps> = ({
  isTestComplete,
  isDarkTheme,
  fontSize,
  themes,
  onFontSizeChange,
}) => {
  if (isTestComplete) return null;

  return (
    <div className="flex items-center justify-center space-x-4 py-4 mb-8">
      <button
        onClick={() => onFontSizeChange(Math.max(25, fontSize - 5))}
        className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
        style={{ 
          backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg,
          color: themes.dark.primary
        }}
      >
        <span className="text-xl">−</span>
      </button>
      <div style={{ color: isDarkTheme ? themes.dark.text : themes.light.text }} className="w-16 text-center">
        {fontSize}px
      </div>
      <button
        onClick={() => onFontSizeChange(Math.min(50, fontSize + 5))}
        className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
        style={{ 
          backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg,
          color: themes.dark.primary
        }}
      >
        <span className="text-xl">+</span>
      </button>
    </div>
  );
};

export default FontSizeControl; 