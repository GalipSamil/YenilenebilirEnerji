import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { geothermalService } from '../services/api';

interface GeothermalData {
  region: string;
  plantCapacity: string;
  dailyProduction: string;
  monthlyProduction: string;
  efficiency: number;
  temperature: number;
  depth: string;
  coordinates: [number, number];
}

const GeothermalPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [geothermalData, setGeothermalData] = useState<GeothermalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await geothermalService.getGeothermalProduction();
        setGeothermalData(response.data.results);
      } catch (err) {
        setError('Veri yüklenirken bir hata oluştu.');
        console.error('Geothermal data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const productionData: ChartData<'line'> = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'Üretim (MWh)',
        data: [120, 125, 130, 135, 140, 138, 135, 130],
        borderColor: 'rgba(244, 67, 54, 1)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const temperatureData: ChartData<'line'> = {
    labels: geothermalData.map(plant => plant.region),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: geothermalData.map(plant => plant.temperature),
        borderColor: 'rgba(244, 67, 54, 1)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'white',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 opacity-75 blur"></div>
          <div className="relative px-8 py-6 bg-gray-900 rounded-lg leading-none flex items-center">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              Jeotermal Veriler Yükleniyor
            </span>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-400 border-t-transparent" />
          <div className="text-lg text-gray-400 max-w-md text-center">
            Türkiye'nin jeotermal enerji verileri toplanıyor...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-2xl text-red-400 mb-6">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="relative inline-flex group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-6 py-3 bg-gray-900 rounded-lg leading-none">
            <span className="text-red-400 group-hover:text-red-300 transition duration-200">
              Tekrar Dene
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
            Jeotermal Enerji Santralleri
          </h1>
          <p className="text-xl text-gray-300">
            Türkiye'nin jeotermal enerji üretim verileri ve santral konumları
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-end gap-3 mb-6">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range as '24h' | '7d' | '30d')}
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedTimeRange === range
                  ? 'text-white'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              {selectedTimeRange === range && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-lg blur opacity-75"></div>
              )}
              <span className="relative">{range}</span>
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-gray-900 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Enerji Üretimi</h2>
              <div className="h-[300px]">
                <Line data={productionData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-gray-900 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Rezervuar Sıcaklıkları</h2>
              <div className="h-[300px]">
                <Line data={temperatureData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {geothermalData.map((plant, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plant.region}</h3>
                    <p className="text-sm text-gray-400">{plant.plantCapacity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Günlük Üretim</div>
                    <div className="text-lg font-semibold text-white">{plant.dailyProduction}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Aylık Üretim</div>
                    <div className="text-lg font-semibold text-white">{plant.monthlyProduction}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Verimlilik</div>
                    <div className="text-lg font-semibold text-green-400">%{plant.efficiency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Derinlik</div>
                    <div className="text-lg font-semibold text-white">{plant.depth}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">Sıcaklık</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 h-2 rounded-full">
                      <div
                        className="bg-red-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(plant.temperature / 200) * 100}%` }}
                      />
                    </div>
                    <div className="text-white font-medium">{plant.temperature}°C</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-gray-900 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Santral Konumları</h2>
            <div className="h-[500px] rounded-xl overflow-hidden">
              <MapContainer
                center={[38.5, 28.5]}
                zoom={7}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {geothermalData.map((plant, index) => (
                  <Marker key={index} position={plant.coordinates}>
                    <Popup>
                      <div className="text-gray-900">
                        <h3 className="font-semibold">{plant.region}</h3>
                        <p>Kapasite: {plant.plantCapacity}</p>
                        <p>Sıcaklık: {plant.temperature}°C</p>
                        <p>Derinlik: {plant.depth}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeothermalPage; 