import React from 'react';

interface WeatherData {
  temperature: string;
  condition: string;
  wind: string;
  humidity: string;
}

interface WeatherWidgetProps {
  weatherData: WeatherData;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherData }) => {
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('güneş') || lowerCondition.includes('açık') || lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('bulut') || lowerCondition.includes('cloud')) return '⛅';
    if (lowerCondition.includes('yağmur') || lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('kar') || lowerCondition.includes('snow')) return '🌨️';
    if (lowerCondition.includes('fırtına') || lowerCondition.includes('storm')) return '⛈️';
    if (lowerCondition.includes('sis') || lowerCondition.includes('fog')) return '🌫️';
    return '🌡️';
  };

  const getWindDirection = (speed: string) => {
    const value = parseInt(speed);
    if (value < 10) return 'Hafif Esinti';
    if (value < 20) return 'Orta Şiddetli';
    if (value < 30) return 'Kuvvetli';
    return 'Çok Kuvvetli';
  };

  const getHumidityLevel = (humidity: string) => {
    const value = parseInt(humidity.replace('%', ''));
    if (value < 30) return 'Düşük';
    if (value < 60) return 'Normal';
    if (value < 80) return 'Yüksek';
    return 'Çok Yüksek';
  };

  return (
    <div className="relative rounded-2xl">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl blur opacity-50"></div>
      <div className="relative bg-gray-900 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              Hava Durumu
            </h3>
            <p className="text-sm text-gray-400">İstanbul, Türkiye</p>
          </div>
          <div className="text-4xl">
            {getWeatherIcon(weatherData.condition)}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-white">
              {weatherData.temperature}
            </div>
            <div className="text-gray-400 text-right">
              {weatherData.condition}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-xl overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <span>💨</span>
                <span>Rüzgar</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {weatherData.wind}
              </div>
              <div className="text-sm text-gray-400">
                {getWindDirection(weatherData.wind)}
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <span>☀️</span>
                <span>Güneş Radyasyonu</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {weatherData.humidity}
              </div>
              <div className="text-sm text-gray-400">
                {parseInt(weatherData.humidity.replace(' W/m²', '')) > 500 ? 'Yüksek' : 'Normal'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Son Güncelleme</span>
            <span className="text-primary-400">
              {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 