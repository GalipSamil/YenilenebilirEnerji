import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EnergyGlobe from '../components/EnergyGlobe';
import WeatherWidget from '../components/WeatherWidget';
import NotificationCenter from '../components/NotificationCenter';
import LiveDataIndicator from '../components/LiveDataIndicator';
import EnergySavingTips from '../components/EnergySavingTips';
import { solarService, windService, geothermalService, weatherService } from '../services/api';

interface ProductionData {
  solar: number;
  wind: number;
  geothermal: number;
}

interface DetailedProductionData {
  daily: {
    solar: { kWh: number; tl: number };
    wind: { kWh: number; tl: number };
    geothermal: { kWh: number; tl: number };
  };
  monthly: {
    solar: { kWh: number; tl: number };
    wind: { kWh: number; tl: number };
    geothermal: { kWh: number; tl: number };
  };
}

interface WeatherData {
  temperature: string;
  condition: string;
  wind: string;
  humidity: string;
}

interface PlantData {
  region: string;
  type: string;
  dailyProduction: number;
  monthlyProduction: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  efficiency: number;
  capacity: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Dashboard: React.FC = () => {
  const [totalProduction, setTotalProduction] = useState<ProductionData>({
    solar: 0,
    wind: 0,
    geothermal: 0
  });

  const [detailedProduction, setDetailedProduction] = useState<DetailedProductionData>({
    daily: {
      solar: { kWh: 0, tl: 0 },
      wind: { kWh: 0, tl: 0 },
      geothermal: { kWh: 0, tl: 0 }
    },
    monthly: {
      solar: { kWh: 0, tl: 0 },
      wind: { kWh: 0, tl: 0 },
      geothermal: { kWh: 0, tl: 0 }
    }
  });

  const [topPlants, setTopPlants] = useState<PlantData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: '--',
    condition: '--',
    wind: '--',
    humidity: '--'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all production data in parallel with longer timeout
        const [solarData, windData, geothermalData, weatherData] = await Promise.all([
          solarService.getSolarProduction().catch(() => ({ data: { results: [] } })),
          windService.getWindProduction().catch(() => ({ data: { results: [] } })),
          geothermalService.getGeothermalProduction().catch(() => ({ data: { results: [] } })),
          weatherService.getWeather(41.0082, 28.9784).catch(() => ({ data: {} }))
        ]);

        // Process solar data
        const solarResults = solarData.data?.results || [];
        const solarTotal = solarResults.reduce((sum: number, region: any) => {
          const dailyProduction = parseFloat(region.dailyProduction?.replace(' kWh', '') || '0');
          return sum + dailyProduction;
        }, 0);

        const solarRevenue = solarResults.reduce((sum: number, region: any) => {
          const dailyRevenue = parseFloat(region.dailyRevenue?.replace(' TL', '') || '0');
          return sum + dailyRevenue;
        }, 0);

        const solarMonthly = solarResults.reduce((sum: number, region: any) => {
          const monthlyProduction = parseFloat(region.monthlyProduction?.replace(' kWh', '') || '0');
          return sum + monthlyProduction;
        }, 0);

        const solarMonthlyRevenue = solarResults.reduce((sum: number, region: any) => {
          const monthlyRevenue = parseFloat(region.monthlyRevenue?.replace(' TL', '') || '0');
          return sum + monthlyRevenue;
        }, 0);

        // Process wind data
        const windResults = windData.data?.results || [];
        const windTotal = windResults.reduce((sum: number, region: any) => {
          const dailyProduction = parseFloat(region.dailyProduction?.replace(' kWh', '') || '0');
          return sum + dailyProduction;
        }, 0);

        const windRevenue = windResults.reduce((sum: number, region: any) => {
          const dailyRevenue = parseFloat(region.dailyRevenue?.replace(' TL', '') || '0');
          return sum + dailyRevenue;
        }, 0);

        const windMonthly = windResults.reduce((sum: number, region: any) => {
          const monthlyProduction = parseFloat(region.monthlyProduction?.replace(' kWh', '') || '0');
          return sum + monthlyProduction;
        }, 0);

        const windMonthlyRevenue = windResults.reduce((sum: number, region: any) => {
          const monthlyRevenue = parseFloat(region.monthlyRevenue?.replace(' TL', '') || '0');
          return sum + monthlyRevenue;
        }, 0);

        // Process geothermal data
        const geothermalResults = geothermalData.data?.results || [];
        const geothermalTotal = geothermalResults.reduce((sum: number, region: any) => {
          const dailyProduction = parseFloat(region.dailyProduction?.replace(' kWh', '') || '0');
          return sum + dailyProduction;
        }, 0);

        const geothermalRevenue = geothermalResults.reduce((sum: number, region: any) => {
          const dailyRevenue = parseFloat(region.dailyRevenue?.replace(' TL', '') || '0');
          return sum + dailyRevenue;
        }, 0);

        const geothermalMonthly = geothermalResults.reduce((sum: number, region: any) => {
          const monthlyProduction = parseFloat(region.monthlyProduction?.replace(' kWh', '') || '0');
          return sum + monthlyProduction;
        }, 0);

        const geothermalMonthlyRevenue = geothermalResults.reduce((sum: number, region: any) => {
          const monthlyRevenue = parseFloat(region.monthlyRevenue?.replace(' TL', '') || '0');
          return sum + monthlyRevenue;
        }, 0);

        setTotalProduction({
          solar: solarTotal / 1000, // Convert to MWh
          wind: windTotal / 1000,
          geothermal: geothermalTotal / 1000
        });

        setDetailedProduction({
          daily: {
            solar: { kWh: solarTotal, tl: solarRevenue },
            wind: { kWh: windTotal, tl: windRevenue },
            geothermal: { kWh: geothermalTotal, tl: geothermalRevenue }
          },
          monthly: {
            solar: { kWh: solarMonthly, tl: solarMonthlyRevenue },
            wind: { kWh: windMonthly, tl: windMonthlyRevenue },
            geothermal: { kWh: geothermalMonthly, tl: geothermalMonthlyRevenue }
          }
        });

        // Create top plants list
        const allPlants: PlantData[] = [];
        
        solarResults.forEach((region: any) => {
          allPlants.push({
            region: region.region,
            type: 'solar',
            dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0'),
            monthlyProduction: parseFloat(region.monthlyProduction?.replace(' kWh', '') || '0'),
            dailyRevenue: parseFloat(region.dailyRevenue?.replace(' TL', '') || '0'),
            monthlyRevenue: parseFloat(region.monthlyRevenue?.replace(' TL', '') || '0'),
            efficiency: Math.round(Math.random() * 20 + 80),
            capacity: region.panelCapacity || '1000 kW'
          });
        });

        windResults.forEach((region: any) => {
          allPlants.push({
            region: region.region,
            type: 'wind',
            dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0'),
            monthlyProduction: parseFloat(region.monthlyProduction?.replace(' kWh', '') || '0'),
            dailyRevenue: parseFloat(region.dailyRevenue?.replace(' TL', '') || '0'),
            monthlyRevenue: parseFloat(region.monthlyRevenue?.replace(' TL', '') || '0'),
            efficiency: Math.round(Math.random() * 15 + 75),
            capacity: region.turbineCapacity || '800 kW'
          });
        });

        geothermalResults.forEach((region: any) => {
          allPlants.push({
            region: region.region,
            type: 'geothermal',
            dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0'),
            monthlyProduction: parseFloat(region.monthlyProduction?.replace(' kWh', '') || '0'),
            dailyRevenue: parseFloat(region.dailyRevenue?.replace(' TL', '') || '0'),
            monthlyRevenue: parseFloat(region.monthlyRevenue?.replace(' TL', '') || '0'),
            efficiency: Math.round(Math.random() * 10 + 85),
            capacity: region.plantCapacity || '500 kW'
          });
        });

        // Sort by efficiency and get top 5
        const topPlantsSorted = allPlants
          .sort((a, b) => b.efficiency - a.efficiency)
          .slice(0, 5);

        setTopPlants(topPlantsSorted);

        // Set weather data
        console.log('Weather API Response:', weatherData.data);
        if (weatherData.data) {
          const translateCondition = (condition: string) => {
            const translations: {[key: string]: string} = {
              'Clear': 'Açık',
              'Clouds': 'Bulutlu', 
              'Rain': 'Yağmurlu',
              'Snow': 'Karlı',
              'Thunderstorm': 'Fırtınalı',
              'Drizzle': 'Çiseli',
              'Mist': 'Sisli',
              'Fog': 'Sisli'
            };
            return translations[condition] || condition;
          };

          const newWeatherData = {
            temperature: `${Math.round(weatherData.data.temperature || 0)}°C`,
            condition: translateCondition(weatherData.data.weatherCondition || '--'),
            wind: `${Math.round(weatherData.data.windSpeed || 0)} km/h`,
            humidity: `${Math.round(weatherData.data.solarRadiation || 0)} W/m²`
          };
          
          console.log('Processed Weather Data:', newWeatherData);
          setWeatherData(newWeatherData);
        }

      } catch (err) {
        setError('Veri yüklenirken hata oluştu');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 10 minutes (increased from 5)
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400 opacity-75 blur"></div>
          <div className="relative px-8 py-6 bg-gray-900 rounded-lg leading-none flex items-center">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              Veriler Yükleniyor
            </span>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-400 border-t-transparent" />
          <div className="text-lg text-gray-400 max-w-md text-center">
            Türkiye'nin 15 farklı bölgesinden yenilenebilir enerji verileri toplanıyor...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-2xl text-red-400 mb-6">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="relative inline-flex group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-6 py-3 bg-gray-900 rounded-lg leading-none">
            <span className="text-primary-400 group-hover:text-primary-300 transition duration-200">
              Tekrar Dene
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-6">
            Yenilenebilir Enerji İzleme Sistemi
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Türkiye'nin yenilenebilir enerji santrallerinin anlık üretim ve performans verileri
          </p>
          <LiveDataIndicator lastUpdate={lastUpdate} />
        </div>

        {/* Revenue Summary */}
        <div className="mb-8">
          <div className="relative rounded-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-gray-900 rounded-2xl p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Günlük Toplam Gelir</h3>
                <div className="text-4xl font-bold text-white mb-4">
                  ₺{(detailedProduction.daily.solar.tl + detailedProduction.daily.wind.tl + detailedProduction.daily.geothermal.tl).toLocaleString()}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-yellow-400 font-medium">☀️ Güneş</div>
                    <div className="text-white">₺{detailedProduction.daily.solar.tl.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-blue-400 font-medium">💨 Rüzgar</div>
                    <div className="text-white">₺{detailedProduction.daily.wind.tl.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-medium">🔥 Jeotermal</div>
                    <div className="text-white">₺{detailedProduction.daily.geothermal.tl.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/solar" className="group">
            <div className="relative rounded-2xl transition-all duration-500 group-hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-2xl">
                    ☀️
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400">Güneş Enerjisi</h3>
                    <p className="text-2xl font-bold text-white">{totalProduction.solar.toFixed(1)} MWh</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/wind" className="group">
            <div className="relative rounded-2xl transition-all duration-500 group-hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                    💨
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400">Rüzgar Enerjisi</h3>
                    <p className="text-2xl font-bold text-white">{totalProduction.wind.toFixed(1)} MWh</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/geothermal" className="group">
            <div className="relative rounded-2xl transition-all duration-500 group-hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">Jeotermal Enerji</h3>
                    <p className="text-2xl font-bold text-white">{totalProduction.geothermal.toFixed(1)} MWh</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Energy Globe */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-gray-900 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-6">
                  Toplam Enerji Üretimi
                </h2>
                <div className="h-[400px]">
                  <EnergyGlobe
                    solarValue={totalProduction.solar}
                    windValue={totalProduction.wind}
                    geothermalValue={totalProduction.geothermal}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weather and Tips */}
          <div className="space-y-8">
            <WeatherWidget weatherData={weatherData} />
            <EnergySavingTips />
          </div>
        </div>

        {/* Top Plants */}
        <div className="relative rounded-2xl mb-12">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl blur opacity-50"></div>
          <div className="relative bg-gray-900 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-8">
              En Verimli Santraller
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPlants.map((plant, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                    index === 0 ? 'border-2 border-yellow-400/50' : 'border border-white/10'
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute -top-3 left-6 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                      🥇 EN VERİMLİ
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      ${plant.type === 'solar' ? 'bg-yellow-500/20' : 
                        plant.type === 'wind' ? 'bg-blue-500/20' : 'bg-red-500/20'}`}
                    >
                      {plant.type === 'solar' ? '☀️' : plant.type === 'wind' ? '💨' : '🔥'}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{plant.region}</h4>
                      <p className="text-sm text-gray-400">
                        {plant.type === 'solar' ? 'Güneş Santrali' : 
                         plant.type === 'wind' ? 'Rüzgar Türbini' : 'Jeotermal Santral'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Verimlilik</div>
                      <div className="text-lg font-semibold text-green-400">
                        {plant.efficiency}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Kapasite</div>
                      <div className="text-lg font-semibold text-white">
                        {plant.capacity}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Günlük Üretim</div>
                      <div className="text-lg font-semibold text-white">
                        {plant.dailyProduction.toLocaleString()} kWh
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Günlük Gelir</div>
                      <div className="text-lg font-semibold text-green-400">
                        ₺{plant.dailyRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <NotificationCenter />
      </div>
    </div>
  );
};

export default Dashboard; 