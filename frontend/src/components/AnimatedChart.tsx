import React, { useEffect, useRef } from 'react';
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
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: any;
  interaction?: any;
  plugins?: any;
  scales?: any;
  elements?: any;
}

interface AnimatedChartProps {
  data: ChartData;
  options?: ChartOptions;
  type?: string;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({ data, options, type = 'line' }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const chart = chartRef.current;

    if (chart) {
      // Animasyon efekti
      chart.data.datasets.forEach((dataset: any, i: number) => {
        dataset.animation = {
          x: {
            type: 'number',
            easing: 'easeOutQuart',
            duration: 1000,
            from: 0,
            delay: i * 100,
          },
          y: {
            type: 'number',
            easing: 'easeOutQuart',
            duration: 1000,
            from: 0,
            delay: i * 100,
          },
        };
      });

      chart.update('none');
    }
  }, [data]);

  const defaultOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 14,
        },
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' MWh';
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return value + ' MWh';
          }
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        borderWidth: 2,
        hoverRadius: 6,
        hoverBorderWidth: 3,
      },
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  return (
    <div style={styles.chartContainer}>
      <div style={styles.chartWrapper}>
        <Line
          ref={chartRef}
          data={data}
          options={mergedOptions}
        />
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  chartContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '300px',
  },
  chartWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '10px',
  },
};

export default AnimatedChart; 