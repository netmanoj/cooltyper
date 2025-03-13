'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Timer from './typing/Timer';
import TypingArea from './typing/TypingArea';
import Stats from './typing/Stats';
import FontSizeControl from './typing/FontSizeControl';
import ResultsDisplay from './ResultsDisplay';
import { generateTestText, themes, SpeedDataPoint } from './typing/utils';

export default function TypingTest() {
  // State declarations
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [time, setTime] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [characters, setCharacters] = useState({ 
    correct: 0, 
    incorrect: 0, 
    extra: 0, 
    missed: 0 
  });
  const [errors, setErrors] = useState(0);
  const [testMode, setTestMode] = useState<'time' | 'words'>('time');
  const [wordCount, setWordCount] = useState(25);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [speedData, setSpeedData] = useState<SpeedDataPoint[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [fontSize, setFontSize] = useState(35);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const selectedTimeRef = useRef(30);
  const inputRef = useRef(input);
  const textRef = useRef(text);
  const charactersRef = useRef(characters);
  const hasInitializedTextRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  // Initialize text based on test mode
  useEffect(() => {
    // Only generate new text if we haven't initialized yet
    if (!hasInitializedTextRef.current) {
      const initialText = testMode === 'time' 
        ? generateTestText(time) 
        : generateTestText(wordCount, 'words');
      setText(initialText);
      hasInitializedTextRef.current = true;
    }
  }, [testMode, time, wordCount]);

  // Update stats calculations
  const updateStats = useCallback((newChar: string, position: number) => {
    const currentText = textRef.current;
    if (position >= currentText.length) return;

    const isCorrect = newChar === currentText[position];
    const newCharacters = {
      correct: isCorrect ? charactersRef.current.correct + 1 : charactersRef.current.correct,
      incorrect: !isCorrect ? charactersRef.current.incorrect + 1 : charactersRef.current.incorrect,
      extra: position >= currentText.length ? charactersRef.current.extra + 1 : charactersRef.current.extra,
      missed: 0 // Calculated at end
    };

    // Calculate missed characters
    if (position === currentText.length - 1) {
      newCharacters.missed = Math.max(0, currentText.length - inputRef.current.length);
    }

    setCharacters(newCharacters);
    
    // Update WPM in real-time
    if (startTimeRef.current) {
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
      const currentWpm = Math.min(Math.round((newCharacters.correct / 5) / timeElapsed), 999);
      
      if (!isNaN(currentWpm)) {
        setWpm(currentWpm);
        setSpeedData(prev => {
          const currentSecond = Math.floor((Date.now() - startTimeRef.current!) / 1000);
          return prev.some(p => p.time === currentSecond) 
            ? prev 
            : [...prev, { time: currentSecond, wpm: currentWpm, raw: currentWpm }];
        });
      }
    }

    // Update accuracy
    const totalTyped = newCharacters.correct + newCharacters.incorrect;
    const newAccuracy = totalTyped > 0
      ? Math.round((newCharacters.correct / totalTyped) * 100)
      : 100;
    setAccuracy(newAccuracy);
    setErrors(newCharacters.incorrect);
  }, []);

  // Calculate final results
  const calculateResults = useCallback(() => {
    if (!startTimeRef.current) return;

    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    const correctChars = charactersRef.current.correct;
    const finalWpm = Math.min(Math.round((correctChars / 5) / (timeElapsed / 60)), 999);
    const totalTyped = correctChars + charactersRef.current.incorrect;
    const finalAccuracy = totalTyped > 0
      ? Math.round((correctChars / totalTyped) * 100)
      : 100;

    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    setErrors(charactersRef.current.incorrect);
    setIsTestComplete(true);
    
    // For time mode, use the initial selected time
    if (testMode === 'time') {
      setTime(selectedTimeRef.current);
    } else {
      // For words mode, use the actual elapsed time
      setTime(Math.round(timeElapsed));
    }
  }, [testMode]);

  // Timer management
  const handleTimerTick = useCallback(() => {
    if (testMode === 'time') {
      setTime(prev => {
        if (prev <= 1) {
          calculateResults();
          return 0;
        }
        return prev - 1;
      });
    } else {
      // For words mode, just increment time
      setTime(prev => prev + 1);
    }
  }, [testMode, calculateResults]);

  // Start/stop timer
  useEffect(() => {
    if (isActive && !isTestComplete) {
      timerRef.current = window.setInterval(handleTimerTick, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isTestComplete, handleTimerTick]);

  // Handle keyboard input
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isTestComplete || e.ctrlKey || e.altKey || e.metaKey) return;

    // Start test on first key press
    if (!isActive) {
      startTimeRef.current = Date.now();
      setIsActive(true);
      containerRef.current?.focus();
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      setInput(prev => prev.slice(0, -1));
      return;
    }

    // Handle regular characters
    if (e.key.length === 1) {
      e.preventDefault();
      setInput(prev => {
        const newInput = prev + e.key;
        
        // Update statistics
        updateStats(e.key, prev.length);

        // Check test completion
        if (testMode === 'words') {
          const typedWords = newInput.split(/\s+/).length;
          if (typedWords >= wordCount) {
            calculateResults();
          }
        } else if (newInput.length >= textRef.current.length) {
          // Only generate new text if we've completed the current text
          setText(generateTestText(time));
          setInput('');
        }

        return newInput;
      });
    }
  }, [isActive, isTestComplete, testMode, wordCount, updateStats, calculateResults, time]);

  // Event listener setup
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Reset test state
  const resetTest = useCallback(() => {
    setInput('');
    setIsActive(false);
    setIsTestComplete(false);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setCharacters({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
    setSpeedData([]);
    startTimeRef.current = null;
    hasInitializedTextRef.current = false;
    
    // Regenerate text based on current mode
    const newText = testMode === 'time' 
      ? generateTestText(time) 
      : generateTestText(wordCount, 'words');
    setText(newText);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    containerRef.current?.focus();
  }, [testMode, time, wordCount]);

  // Mode change handler
  const handleModeChange = (mode: 'time' | 'words') => {
    setTestMode(mode);
    resetTest();
  };

  // Time/word count change handlers
  const handleTimeChange = (newTime: number) => {
    setTime(newTime);
    selectedTimeRef.current = newTime;
    resetTest();
  };

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
    resetTest();
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{ 
        backgroundColor: isDarkTheme ? themes.dark.background : themes.light.background,
        color: isDarkTheme ? themes.dark.text : themes.light.text 
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4">
        <Navbar
          onModeChange={handleModeChange}
          onTimeChange={handleTimeChange}
          onWordCountChange={handleWordCountChange}
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme(!isDarkTheme)}
          currentMode={testMode}
          themes={themes}
        />
        
        {testMode === 'time' && (
          <Timer 
            time={time}
            isActive={isActive}
            isDarkTheme={isDarkTheme}
            themes={themes}
          />
        )}

        <TypingArea 
          text={text}
          input={input}
          isActive={isActive}
          isTestComplete={isTestComplete}
          isDarkTheme={isDarkTheme}
          fontSize={fontSize}
          themes={themes}
          containerRef={containerRef}
          onContainerClick={() => containerRef.current?.focus()}
        />

        <FontSizeControl 
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isDarkTheme={isDarkTheme}
          themes={themes}
          isTestComplete={isTestComplete}
        />

        <Stats 
          wpm={wpm}
          accuracy={accuracy}
          errors={errors}
          characters={characters}
          time={time}
          speedData={speedData}
          isTestComplete={isTestComplete}
          isDarkTheme={isDarkTheme}
          themes={themes}
          isActive={isActive}
        />

        {isTestComplete && (
          <ResultsDisplay
            results={{
              wpm,
              accuracy,
              duration: time,
              typingData: speedData
            }}
            onRestart={resetTest}
            isDarkTheme={isDarkTheme}
            themes={themes}
          />
        )}

        {!isTestComplete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTest}
            className="w-full py-2 sm:py-3 mt-8 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            style={{ 
              backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg,
              color: isDarkTheme ? themes.dark.text : themes.light.text
            }}
          >
            Reset Test
          </motion.button>
        )}
      </div>
    </div>
  );
}