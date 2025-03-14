import React from 'react';

interface TypingAreaProps {
  text: string;
  input: string;
  isActive: boolean;
  isTestComplete: boolean;
  isDarkTheme: boolean;
  fontSize: number;
  themes: {
    dark: {
      text: string;
      textDark: string;
      containerBg: string;
      error: string;
      primary: string;
    };
    light: {
      text: string;
      textDark: string;
      containerBg: string;
    };
  };
  containerRef: React.RefObject<HTMLDivElement | null>;
  onContainerClick: () => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  text,
  input,
  isActive,
  isTestComplete,
  isDarkTheme,
  fontSize,
  themes,
  containerRef,
  onContainerClick,
}) => {
  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onClick={onContainerClick}
      className={`mb-4 sm:mb-8 outline-none cursor-default select-none transition-all duration-200 p-2 sm:p-4 rounded-lg overflow-hidden ${
        isActive ? 'ring-2 ring-[#e2b714]' : ''
      }`}
      style={{ 
        backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg,
      }}
    >
      <div className="typing-text mb-4 font-mono relative text-base sm:text-xl break-words" style={{ 
        maxWidth: '100%',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        fontSize: `${fontSize}px`
      }}>
        {text.split('').map((char, index) => {
          let color = isDarkTheme ? themes.dark.textDark : themes.light.textDark;
          
          if (index < input.length) {
            if (input[index] === char) {
              color = isDarkTheme ? themes.dark.text : themes.light.text;
            } else {
              color = themes.dark.error;
            }
          }

          const isCurrentChar = index === input.length && !isTestComplete;

          return (
            <span
              key={index}
              className={`${char === ' ' ? 'px-0.5 sm:px-1' : ''} ${
                isCurrentChar ? 'relative after:content-[""] after:absolute after:top-0 after:left-[-1px] after:w-0.5 after:h-full after:bg-[#e2b714] after:animate-blink' : ''
              }`}
              style={{ color, display: 'inline-block', position: 'relative', lineHeight: '1.2em' }}
            >
              {char}
            </span>
          );
        })}
      </div>
      
      <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm mt-2 sm:mt-4">
        {isActive ? 'typing...' : 'click here or start typing to begin'}
      </div>
    </div>
  );
};

export default TypingArea; 