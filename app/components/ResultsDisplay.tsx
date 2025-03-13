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
  ChartOptions
} from 'chart.js';

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
}

interface Results {
  wpm: number;
  accuracy: number;
  duration: number;
  typingData?: TypingDataPoint[];
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

interface ResultsDisplayProps {
  results: Results;
  onRestart: () => void;
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

const ResultsGraph = ({ typingData, isDarkTheme, themes }: ResultsGraphProps) => {
  const textColor = isDarkTheme ? themes.dark.text : themes.light.text;
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (seconds)',
          color: textColor,
          font: {
            size: 12
          }
        },
        ticks: {
          color: textColor,
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: {
          color: gridColor
        }
      },
      y: {
        title: {
          display: true,
          text: 'WPM',
          color: textColor,
          font: {
            size: 12
          }
        },
        beginAtZero: true,
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor
        }
      },
      title: {
        display: true,
        text: 'Typing Speed Over Time',
        color: textColor,
        font: {
          size: 14
        }
      }
    }
  };

  const data = {
    labels: typingData.map((point) => Math.floor(point.time)),
    datasets: [
      {
        label: 'WPM',
        data: typingData.map(point => point.wpm),
        borderColor: themes.dark.primary,
        backgroundColor: themes.dark.primary,
        tension: 0.1,
        fill: false
      }
    ]
  };

  return (
    <div className="w-full h-[300px] bg-opacity-50 rounded-lg p-4" style={{ 
      backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg 
    }}>
      <Line options={options} data={data} />
    </div>
  );
};

const ResultsDisplay = ({ results, onRestart, isDarkTheme, themes }: ResultsDisplayProps) => {
  if (!results) return null;

  return (
    <div className="results-container space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-item p-4 rounded-lg" style={{ 
          backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg 
        }}>
          <h3 className="text-sm sm:text-base" style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }}>WPM</h3>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>{Math.round(results.wpm)}</p>
        </div>
        <div className="stat-item p-4 rounded-lg" style={{ 
          backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg 
        }}>
          <h3 className="text-sm sm:text-base" style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }}>Accuracy</h3>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>{Math.round(results.accuracy)}%</p>
        </div>
        <div className="stat-item p-4 rounded-lg" style={{ 
          backgroundColor: isDarkTheme ? themes.dark.containerBg : themes.light.containerBg 
        }}>
          <h3 className="text-sm sm:text-base" style={{ color: isDarkTheme ? themes.dark.textDark : themes.light.textDark }}>Time</h3>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: themes.dark.primary }}>{results.duration.toFixed(1)}s</p>
        </div>
      </div>

      {results.typingData && results.typingData.length > 0 && (
        <div className="graph-container">
          <ResultsGraph 
            typingData={results.typingData} 
            isDarkTheme={isDarkTheme}
            themes={themes}
          />
        </div>
      )}

      <button 
        className="w-full py-3 rounded-lg font-semibold transition-colors"
        style={{ 
          backgroundColor: themes.dark.primary,
          color: '#ffffff'
        }}
        onClick={onRestart}
      >
        Try Again
      </button>
    </div>
  );
};

export default ResultsDisplay; 