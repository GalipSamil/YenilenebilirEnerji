import axios from 'axios';

const API_URL = 'http://localhost:5283/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout for NASA API calls
  headers: {
    'Content-Type': 'application/json'
  }
});

// Real API services
export const weatherService = {
  getWeather: async (lat: number, lng: number) => {
    return api.get(`/energy/weather/${lat}/${lng}`);
  }
};

export const solarService = {
  getSolarRadiation: async (lat: number, lng: number) => {
    return api.get(`/energy/solar-radiation/${lat}/${lng}`);
  },
  getSolarProduction: async () => {
    return api.get('/calculation/solar-production');
  }
};

export const windService = {
  getWindProduction: async () => {
    return api.get('/calculation/wind-production');
  }
};

export const geothermalService = {
  getGeothermalProduction: async () => {
    return api.get('/calculation/geothermal-production');
  }
};

export const teiasService = {
  getRealTimeProduction: async () => {
    return api.get('/teias/real-time-production');
  },
  getWindPowerPlants: async () => {
    return api.get('/teias/wind-power-plants');
  },
  getSolarPowerPlants: async () => {
    return api.get('/teias/solar-power-plants');
  }
};

export const getGeothermalProduction = async () => {
  const response = await axios.get(`${API_URL}/Calculation/geothermal-production`);
  return response.data;
};

export const getPlantDetails = async (plantId: number) => {
  const response = await axios.get(`${API_URL}/Calculation/plant/${plantId}`);
  return response.data;
};

// Legacy mock data for fallback
const mockData = {
  weather: {
    temperature: '24°C',
    condition: 'Güneşli',
    wind: '12 km/h',
    humidity: '%65'
  },
  stats: {
    solarPercentage: 75,
    windPercentage: 60,
    geothermalPercentage: 85,
    daily: 88,
    weekly: 92,
    monthly: 85,
    totalProduction: 1250,
    dailyChange: '+5.2'
  },
  notifications: [
    {
      id: 1,
      type: 'success',
      message: 'Güneş panelleri optimum verimde çalışıyor',
      time: '10 dakika önce',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'Rüzgar türbini bakım zamanı yaklaşıyor',
      time: '1 saat önce',
      read: false
    },
    {
      id: 3,
      type: 'info',
      message: 'Jeotermal santral günlük raporu hazır',
      time: '2 saat önce',
      read: true
    }
  ],
  plants: [
    {
      id: 1,
      name: 'Güneş Parkı A',
      type: 'solar',
      capacity: '234.5',
      efficiency: 95,
      dailyProduction: 156.7,
      status: 'active'
    },
    {
      id: 2,
      name: 'Rüzgar Çiftliği B',
      type: 'wind',
      capacity: '189.3',
      efficiency: 88,
      dailyProduction: 145.6,
      status: 'active'
    },
    {
      id: 3,
      name: 'Jeotermal Santral C',
      type: 'geothermal',
      capacity: '145.2',
      efficiency: 92,
      dailyProduction: 134.5,
      status: 'maintenance'
    }
  ]
};

// Fallback services (if API is not available)
export const fallbackService = {
  getWeather: async () => Promise.resolve(mockData.weather),
  getPerformanceMetrics: async () => Promise.resolve(mockData.stats),
  getNotifications: async () => Promise.resolve(mockData.notifications),
  getAllPlants: async () => Promise.resolve(mockData.plants),
  getPlantsByType: async (type: string) => Promise.resolve(mockData.plants.filter(p => p.type === type))
};

export default api; 