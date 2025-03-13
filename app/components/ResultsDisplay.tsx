const ResultsGraph = ({ typingData }) => {
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
    labels: typingData.map((point, index) => Math.floor(point.time)),
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

const ResultsDisplay = ({ results, onRestart }) => {
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