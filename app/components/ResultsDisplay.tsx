import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Scale,
  CoreScaleOptions,
  TooltipItem
} from 'chart.js';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TypingDataPoint {
  time: number;
  wpm: number;
  raw: number;
}

interface Results {
  wpm: number;
  accuracy: number;
  duration: number;
  typingData: TypingDataPoint[];
}

interface ResultsDisplayProps {
  results: Results;
  onRestart: () => void;
  isDarkTheme: boolean;
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

interface ResultsGraphProps {
  typingData: TypingDataPoint[];
  isDarkTheme: boolean;
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
}

const ResultsGraph: React.FC<ResultsGraphProps> = ({ typingData, isDarkTheme, themes }) => {
  const textColor = isDarkTheme ? themes.dark.text : themes.light.text;
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Filter out initial spike and ensure data starts from 0
  const filteredData = typingData
    .filter(point => point.time >= 1) // Remove data points before 1 second
    .map(point => ({
      ...point,
      wpm: Math.round(Math.max(0, point.wpm)) // Round WPM to whole numbers and ensure non-negative
    }));

  // Add a zero point at the start for better visualization
  const dataWithStart = [
    { time: 0, wpm: 0, raw: 0 },
    ...filteredData
  ];

  // Find maximum WPM and round up to nearest 10
  const maxValue = Math.max(...filteredData.map(point => point.wpm));
  const yAxisMax = Math.ceil(maxValue / 10) * 10;
  const stepSize = Math.max(5, Math.ceil(yAxisMax / 10));

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 15,
        left: 10
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (seconds)',
          color: textColor,
          font: {
            size: 12
          },
          padding: { top: 15 }
        },
        ticks: {
          color: textColor,
          autoSkip: true,
          maxTicksLimit: 10,
          stepSize: 1,
          padding: 8,
          font: {
            size: 11
          },
          callback: function(this: Scale<CoreScaleOptions>, value: number | string) {
            return `${value}s`;
          }
        },
        grid: {
          color: gridColor,
          drawTicks: false
        },
        border: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'WPM',
          color: textColor,
          font: {
            size: 12
          },
          padding: { top: 0, bottom: 0 }
        },
        beginAtZero: true,
        min: 0,
        max: yAxisMax,
        ticks: {
          color: textColor,
          stepSize: stepSize,
          padding: 8,
          font: {
            size: 11
          },
          callback: function(this: Scale<CoreScaleOptions>, value: number | string) {
            return Math.round(Number(value));
          }
        },
        grid: {
          color: gridColor,
          drawTicks: false
        },
        border: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: themes.dark.primary,
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            return `WPM: ${Math.round(context.parsed.y)}`;
          }
        }
      }
    }
  };

  const data = {
    labels: dataWithStart.map((point) => Math.floor(point.time)),
    datasets: [
      {
        label: 'WPM',
        data: dataWithStart.map(point => Math.round(point.wpm)),
        borderColor: themes.dark.primary,
        backgroundColor: themes.dark.primary,
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: themes.dark.primary,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  return (
    <div className="w-full h-[300px] rounded-lg p-4" style={{ 
      backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg 
    }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default function ResultsDisplay({ results, onRestart, isDarkTheme, themes }: ResultsDisplayProps) {
  const currentTheme = isDarkTheme ? themes.dark : themes.light;

  // Improved consistency calculation
  const calculateConsistency = () => {
    // Need at least 2 data points for consistency calculation
    if (results.typingData.length < 2) return 100;

    // Get valid WPM values (filter out extreme outliers and 0s)
    const validWpms = results.typingData
      .map(p => p.wpm)
      .filter(wpm => wpm > 0 && wpm <= 200);

    if (validWpms.length < 2) return 100;

    // Calculate mean WPM
    const mean = validWpms.reduce((sum, wpm) => sum + wpm, 0) / validWpms.length;

    // Calculate standard deviation
    const squareDiffs = validWpms.map(wpm => Math.pow(wpm - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // Calculate coefficient of variation (CV)
    const cv = (stdDev / mean) * 100;

    // Convert CV to a consistency score (0-100)
    // Lower CV means higher consistency
    // We'll consider a CV of 50 or higher as 0% consistency
    // and a CV of 0 as 100% consistency
    const consistency = Math.max(0, Math.min(100, 100 - (cv * 2)));
    
    return Math.round(consistency);
  };

  // Calculate raw WPM (average of last 3 data points to smooth it out)
  const calculateRawWpm = () => {
    const lastThreePoints = results.typingData.slice(-3);
    if (lastThreePoints.length === 0) return 0;
    
    const rawWpms = lastThreePoints.map(point => point.raw);
    return Math.round(rawWpms.reduce((sum, wpm) => sum + wpm, 0) / rawWpms.length);
  };

  const rawWpm = calculateRawWpm();
  const consistency = calculateConsistency();

  const handleShare = async () => {
    try {
      const element = document.getElementById('results-container');
      if (!element) return;

      const canvas = await html2canvas(element);
      const dataUrl = canvas.toDataURL('image/png');

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `typing-test-results-${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Try to use Web Share API if available
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'typing-results.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Typing Test Results',
          text: `Check out my typing speed: ${results.wpm} WPM with ${results.accuracy}% accuracy!`,
          files: [file]
        });
      }
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  return (
    <div id="results-container" className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: currentTheme.containerBg }}>
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div 
          className="flex flex-col items-center justify-center p-5 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-4xl sm:text-5xl font-bold" style={{ color: themes.dark.primary }}>{results.wpm}</span>
          <span className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-2" style={{ color: currentTheme.textDark }}>WPM</span>
          <span className="text-xs mt-1 opacity-75" style={{ color: currentTheme.textDark }}>net speed</span>
        </div>
        <div 
          className="flex flex-col items-center justify-center p-5 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-4xl sm:text-5xl font-bold" style={{ color: themes.dark.primary }}>{results.accuracy}%</span>
          <span className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-2" style={{ color: currentTheme.textDark }}>Accuracy</span>
          <span className="text-xs mt-1 opacity-75" style={{ color: currentTheme.textDark }}>correct keystrokes</span>
        </div>
        <div 
          className="flex flex-col items-center justify-center p-5 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-4xl sm:text-5xl font-bold" style={{ color: themes.dark.primary }}>{results.duration}s</span>
          <span className="text-xs sm:text-sm uppercase tracking-wider font-medium mt-2" style={{ color: currentTheme.textDark }}>Duration</span>
          <span className="text-xs mt-1 opacity-75" style={{ color: currentTheme.textDark }}>test length</span>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div 
          className="flex flex-col items-center justify-center p-4 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>{rawWpm}</span>
          <span className="text-xs uppercase tracking-wider font-medium mt-1" style={{ color: currentTheme.textDark }}>Raw WPM</span>
          <span className="text-[10px] mt-1 opacity-75 text-center" style={{ color: currentTheme.textDark }}>speed without errors</span>
        </div>
        <div 
          className="flex flex-col items-center justify-center p-4 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>{consistency}%</span>
          <span className="text-xs uppercase tracking-wider font-medium mt-1" style={{ color: currentTheme.textDark }}>Consistency</span>
          <span className="text-[10px] mt-1 opacity-75 text-center" style={{ color: currentTheme.textDark }}>speed variation</span>
        </div>
        <div 
          className="flex flex-col items-center justify-center p-4 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>
            {results.typingData.length > 0 ? Math.round(results.typingData[results.typingData.length - 1].time) : 0}s
          </span>
          <span className="text-xs uppercase tracking-wider font-medium mt-1" style={{ color: currentTheme.textDark }}>Time</span>
          <span className="text-[10px] mt-1 opacity-75 text-center" style={{ color: currentTheme.textDark }}>total time taken</span>
        </div>
        <div 
          className="flex flex-col items-center justify-center p-4 rounded-xl transition-transform hover:scale-102"
          style={{ backgroundColor: currentTheme.background }}
        >
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>
            {Math.round(results.wpm * results.duration / 60)} chars
          </span>
          <span className="text-xs uppercase tracking-wider font-medium mt-1" style={{ color: currentTheme.textDark }}>Characters</span>
          <span className="text-[10px] mt-1 opacity-75 text-center" style={{ color: currentTheme.textDark }}>total typed</span>
        </div>
      </div>

      {/* Graph */}
      <div className="h-64 w-full p-4 rounded-xl mb-8" style={{ backgroundColor: currentTheme.background }}>
        <ResultsGraph 
          typingData={results.typingData}
          isDarkTheme={isDarkTheme}
          themes={themes}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:opacity-95"
          style={{ backgroundColor: themes.dark.primary, color: currentTheme.background }}
        >
          Try Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:opacity-95"
          style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
        >
          Share Results
        </motion.button>
      </div>
    </div>
  );
} 