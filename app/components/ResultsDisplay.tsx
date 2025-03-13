import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
}

interface ResultsDisplayProps {
  results: Results;
  onRestart: () => void;
}

const ResultsGraph = ({ typingData }: ResultsGraphProps) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (seconds)'
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        title: {
          display: true,
          text: 'WPM'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Typing Speed Over Time'
      }
    }
  };

  // Process data for the graph
  const data = {
    labels: typingData.map((point) => Math.floor(point.time)),
    datasets: [
      {
        label: 'WPM',
        data: typingData.map(point => point.wpm),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line options={options} data={data} />
    </div>
  );
};

const ResultsDisplay = ({ results, onRestart }: ResultsDisplayProps) => {
  if (!results) return null;

  return (
    <div className="results-container">
      <div className="stats">
        <div className="stat-item">
          <h3>WPM</h3>
          <p>{Math.round(results.wpm)}</p>
        </div>
        <div className="stat-item">
          <h3>Accuracy</h3>
          <p>{Math.round(results.accuracy)}%</p>
        </div>
        <div className="stat-item">
          <h3>Time</h3>
          <p>{results.duration.toFixed(1)}s</p>
        </div>
      </div>

      {results.typingData && results.typingData.length > 0 && (
        <div className="graph-container">
          <ResultsGraph typingData={results.typingData} />
        </div>
      )}

      <button 
        className="restart-button"
        onClick={onRestart}
      >
        Try Again
      </button>
    </div>
  );
};

export default ResultsDisplay; 