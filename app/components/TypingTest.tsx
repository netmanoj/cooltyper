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
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import HistoryButton from './HistoryButton';

interface CharacterStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export default function TypingTest() {
  // State declarations
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [time, setTime] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [characters, setCharacters] = useState<CharacterStats>({ 
    correct: 0, 
    incorrect: 0, 
    extra: 0, 
    missed: 0 
  });
  const [errors, setErrors] = useState(0);
  const [testMode, setTestMode] = useState<'time' | 'words' | 'quote' | 'custom'>('time');
  const [wordCount, setWordCount] = useState(25);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [speedData, setSpeedData] = useState<SpeedDataPoint[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [fontSize, setFontSize] = useState(35);
  const [customText, setCustomText] = useState('');
  const { user } = useAuth();

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
    // Only generate new text when test mode changes or on first mount
    if (!hasInitializedTextRef.current || customText) {
      const initialText = generateTestText(selectedTimeRef.current, testMode, customText);
      setText(initialText);
      hasInitializedTextRef.current = true;
    }
  }, [testMode, customText]);

  // Handle time/word count changes separately
  useEffect(() => {
    if (testMode === 'time' && !isActive) {
      selectedTimeRef.current = time;
    }
  }, [time, testMode, isActive]);

  useEffect(() => {
    if (testMode === 'words' && !isActive) {
      const newText = generateTestText(wordCount, testMode);
      setText(newText);
    }
  }, [wordCount, testMode, isActive]);

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
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000 / 60; // Convert to minutes
      if (timeElapsed > 0) {
        // Calculate WPM: (characters typed per minute) / 5 characters per word
        const charsPerMinute = newCharacters.correct / timeElapsed;
        const grossWpm = Math.round(charsPerMinute / 5);
        const currentWpm = Math.min(Math.max(0, grossWpm), 250);
        
        if (!isNaN(currentWpm)) {
          setWpm(currentWpm);
          setSpeedData(prev => {
            const currentSecond = Math.floor((Date.now() - startTimeRef.current!) / 1000);
            // Only add new data point if it's a new second
            return prev.some(p => p.time === currentSecond) 
              ? prev 
              : [...prev, { time: currentSecond, wpm: currentWpm, raw: grossWpm }];
          });
        }
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
  const calculateResults = useCallback(async () => {
    if (!startTimeRef.current) return;

    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    const correctChars = charactersRef.current.correct;
    
    // Calculate final WPM: (characters typed per minute) / 5 characters per word
    const charsPerMinute = (correctChars / timeElapsed) * 60; // Convert to per minute
    const grossWpm = Math.round(charsPerMinute / 5);
    const finalWpm = Math.min(Math.max(0, grossWpm), 250);
    
    const totalTyped = correctChars + charactersRef.current.incorrect;
    const finalAccuracy = totalTyped > 0
      ? Math.round((correctChars / totalTyped) * 100)
      : 100;

    // For time mode, use the initial selected time
    const finalDuration = testMode === 'time' ? selectedTimeRef.current : Math.round(timeElapsed);

    // Calculate total characters and errors
    const totalCharacters = charactersRef.current.correct + 
                          charactersRef.current.incorrect + 
                          charactersRef.current.extra + 
                          charactersRef.current.missed;
    
    const totalErrors = charactersRef.current.incorrect + 
                       charactersRef.current.extra + 
                       charactersRef.current.missed;

    // Update state
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    setErrors(totalErrors);
    setTime(finalDuration);
    setIsTestComplete(true);
    setIsActive(false);

    // Update speed data for the graph
    setSpeedData((prevData) => [
      ...prevData,
      { time: finalDuration, wpm: finalWpm, raw: finalWpm },
    ]);

    // Save results to Supabase
    if (user) {
      try {
        // Log current user state for debugging
        console.log('Current user state when saving:', {
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date().toISOString()
        });

        const result = {
          user_id: user.id,
          wpm: Number(finalWpm),
          accuracy: Number(finalAccuracy),
          duration: Number(finalDuration),
          errors: Number(totalErrors),
          characters: Number(totalCharacters),
          mode: testMode
        };

        console.log('Attempting to save result:', result);

        const { data, error } = await supabase
          .from('typing_results')
          .insert([result]);

        if (error) {
          console.error('Supabase error details:', error.message);
          console.error('Error code:', error.code);
          console.error('Error details:', error.details);
          throw error;
        }

        console.log('Successfully saved result');
      } catch (err) {
        console.error('Error saving results:', err);
        if (err instanceof Error) {
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }
      }
    }
  }, [testMode, user]);

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

    // Handle Enter key to stop test in non-time modes
    if (e.key === 'Enter' && testMode !== 'time' && isActive) {
      e.preventDefault();
      calculateResults();
      return;
    }

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

        // Check test completion for word count mode
        if (testMode === 'words') {
          const typedWords = newInput.split(/\s+/).length;
          if (typedWords >= wordCount) {
            calculateResults();
          }
        } else if (newInput.length >= textRef.current.length) {
          // For time mode, only generate new text if there's time remaining and current text is completed correctly
          if (testMode === 'time' && time > 0 && charactersRef.current.incorrect === 0) {
            const newText = generateTestText(time);
            setText(newText);
            setInput('');
            // Reset character stats for the new text
            setCharacters({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
          } else {
            calculateResults();
          }
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
    let newText;
    if (testMode === 'custom') {
      newText = customText || 'Type or paste your custom text here...';
    } else if (testMode === 'quote') {
      newText = generateTestText(0, 'quote');
    } else {
      newText = generateTestText(
        testMode === 'time' ? time : wordCount,
        testMode
      );
    }
    setText(newText);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    containerRef.current?.focus();
  }, [testMode, time, wordCount]);

  // Mode change handler
  const handleModeChange = (mode: 'time' | 'words' | 'quote' | 'custom') => {
    setTestMode(mode);
    if (mode === 'custom') {
      setCustomText('Type or paste your custom text here...');
    }
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

  const calculateWPM = (chars: CharacterStats, seconds: number): number => {
    const minutes = seconds / 60;
    const totalChars = chars.correct; // Only count correct characters
    return Math.round((totalChars / 5) / minutes); // Standard: 5 characters = 1 word
  };

  const calculateAccuracy = (chars: CharacterStats): number => {
    const totalAttempted = chars.correct + chars.incorrect + chars.extra + chars.missed;
    if (totalAttempted === 0) return 100;
    return Math.round((chars.correct / totalAttempted) * 100);
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

        {testMode === 'custom' && !isActive && !isTestComplete && (
          <div className="mb-8">
            <textarea
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setText(e.target.value);
                hasInitializedTextRef.current = true;
              }}
              className="w-full h-32 p-4 rounded-lg bg-[#262626] text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Type or paste your custom text here..."
            />
          </div>
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
          isDarkTheme={isDarkTheme}
          themes={themes}
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

        {!isTestComplete && <HistoryButton />}
      </div>
    </div>
  );
}