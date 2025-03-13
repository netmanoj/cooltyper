import React from 'react';

interface SpeedDataPoint {
  time: number;
  wpm: number;
  raw: number;
}

interface StatsProps {
  isTestComplete: boolean;
  isActive: boolean;
  wpm: number;
  accuracy: number;
  errors: number;
  isDarkTheme: boolean;
  themes: {
    dark: {
      text: string;
      textDark: string;
      primary: string;
    };
    light: {
      text: string;
      textDark: string;
    };
  };
  speedData: SpeedDataPoint[];
  characters: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  time: number;
}

const Stats: React.FC<StatsProps> = ({
  isTestComplete,
  isActive,
  wpm,
  accuracy,
  errors,
  isDarkTheme,
  themes,
  speedData,
  characters,
  time,
}) => {
  // Calculate consistency internally
  const calculateConsistency = () => {
    if (speedData.length < 2) return 100;
    const avgWpm = speedData.reduce((sum, p) => sum + p.wpm, 0) / speedData.length;
    const variance = speedData.reduce((sum, p) => sum + Math.pow(p.wpm - avgWpm, 2), 0) / speedData.length;
    return Math.max(0, 100 - (Math.sqrt(variance) / avgWpm) * 100);
  };

  if (isTestComplete) {
    return (
      <div className="space-y-4 sm:space-y-8">
        {/* Main stats */}
        <div className="grid grid-cols-2 gap-x-8 sm:gap-x-32">
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xl sm:text-2xl">wpm</div>
            <div style={{ color: themes.dark.primary }} className="text-4xl sm:text-7xl font-mono">{wpm}</div>
          </div>
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xl sm:text-2xl">acc</div>
            <div style={{ color: themes.dark.primary }} className="text-4xl sm:text-7xl font-mono">{accuracy}%</div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">test type</div>
            <div style={{ color: themes.dark.primary }}>
              time {time}
              <div className="text-xs sm:text-sm">english</div>
            </div>
          </div>
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">raw</div>
            <div style={{ color: themes.dark.primary }} className="text-xl sm:text-2xl">{Math.round(speedData[speedData.length - 1]?.raw || 0)}</div>
          </div>
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">characters</div>
            <div style={{ color: themes.dark.primary }} className="text-xl sm:text-2xl">
              {characters.correct}/{characters.incorrect}/{characters.extra}/{characters.missed}
            </div>
          </div>
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">consistency</div>
            <div style={{ color: themes.dark.primary }} className="text-xl sm:text-2xl">{calculateConsistency()}%</div>
          </div>
          <div className="col-span-2 sm:col-span-3"></div>
          <div>
            <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">time</div>
            <div style={{ color: themes.dark.primary }} className="text-xl sm:text-2xl">{time}s</div>
            <div className="text-xs">00:00:15 session</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8">
      <div className="flex flex-col items-start">
        <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">wpm</div>
        <div style={{ color: isDarkTheme ? themes.dark.text : themes.light.text }} className="text-lg sm:text-2xl">
          {isActive ? wpm : ''}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">accuracy</div>
        <div style={{ color: isDarkTheme ? themes.dark.text : themes.light.text }} className="text-lg sm:text-2xl">
          {isActive ? `${accuracy}%` : ''}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <div style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }} className="text-xs sm:text-sm">errors</div>
        <div style={{ color: isDarkTheme ? themes.dark.text : themes.light.text }} className="text-lg sm:text-2xl">
          {isActive ? errors : ''}
        </div>
      </div>
    </div>
  );
};

export default Stats;

 