import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { solarService } from '../services/api';

interface SolarData {
  region: string;
  panelCapacity: string;
  dailyProduction: string;
  monthlyProduction: string;
  efficiency: number;
  sunHours: number;
  panelCount: string;
  coordinates: [number, number];
}

const SolarPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [solarData, setSolarData] = useState<SolarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await solarService.getSolarProduction();
        setSolarData(response.data.results);
      } catch (err) {
        setError('Veri yüklenirken bir hata oluştu.');
        console.error('Solar data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const productionData: ChartData<'line'> = {
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    datasets: [
      {
        label: 'Üretim (MWh)',
        data: [50, 120, 180, 200, 190, 150, 80, 20],
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const efficiencyData: ChartData<'line'> = {
    labels: solarData.map(plant => plant.region),
    datasets: [
      {
        label: 'Verimlilik (%)',
        data: solarData.map(plant => plant.efficiency),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
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
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 opacity-75 blur"></div>
          <div className="relative px-8 py-6 bg-gray-900 rounded-lg leading-none flex items-center">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Güneş Enerjisi Verileri Yükleniyor
            </span>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent" />
          <div className="text-lg text-gray-400 max-w-md text-center">
            Türkiye'nin güneş enerjisi verileri toplanıyor...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-2xl text-yellow-400 mb-6">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="relative inline-flex group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-6 py-3 bg-gray-900 rounded-lg leading-none">
            <span className="text-yellow-400 group-hover:text-yellow-300 transition duration-200">
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
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
            Güneş Enerjisi Santralleri
          </h1>
          <p className="text-xl text-gray-300">
            Türkiye'nin güneş enerjisi üretim verileri ve santral konumları
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
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              {selectedTimeRange === range && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg blur opacity-75"></div>
              )}
              <span className="relative">{range}</span>
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-gray-900 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Enerji Üretimi</h2>
              <div className="h-[300px]">
                <Line data={productionData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-gray-900 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Panel Verimlilikleri</h2>
              <div className="h-[300px]">
                <Line data={efficiencyData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solarData.map((plant, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl">
                    ☀️
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plant.region}</h3>
                    <p className="text-sm text-gray-400">{plant.panelCapacity}</p>
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
                    <div className="text-sm text-gray-400">Panel Sayısı</div>
                    <div className="text-lg font-semibold text-white">{plant.panelCount}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">Günlük Güneşlenme</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 h-2 rounded-full">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(plant.sunHours / 12) * 100}%` }}
                      />
                    </div>
                    <div className="text-white font-medium">{plant.sunHours} saat</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-gray-900 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Santral Konumları</h2>
            <div className="h-[500px] rounded-xl overflow-hidden">
              <MapContainer
                center={[39.9334, 32.8597]}
                zoom={6}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {solarData.map((plant, index) => (
                  <Marker key={index} position={plant.coordinates}>
                    <Popup>
                      <div className="text-gray-900">
                        <h3 className="font-semibold">{plant.region}</h3>
                        <p>Kapasite: {plant.panelCapacity}</p>
                        <p>Panel Sayısı: {plant.panelCount}</p>
                        <p>Güneşlenme: {plant.sunHours} saat</p>
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

export default SolarPage; 