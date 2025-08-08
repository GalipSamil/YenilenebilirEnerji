import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faChartLine, 
  faCog, 
  faDatabase,
  faSearch,
  faSignOutAlt,
  faUserShield,
  faBolt,
  faLeaf,
  faWind,
  faFire,
  faEye,
  faRefresh,
  faEdit,
  faTrash,
  faPlus,

  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface EnergyPlant {
  id: number;
  name: string;
  type: string | number;
  capacity: number;
  status: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [plants, setPlants] = useState<EnergyPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    type: 'Solar',
    capacity: '',
    latitude: '',
    longitude: '',
    address: ''
  });
  const [nearbyPlants, setNearbyPlants] = useState<EnergyPlant[]>([]);
  const [showNearbyPlants, setShowNearbyPlants] = useState(false);
  const [searchLocation, setSearchLocation] = useState({ lat: 0, lon: 0 });
  const navigate = useNavigate();

  // Cache management
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedData = (key: string) => {
    const cached = localStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data.value;
      }
    }
    return null;
  };

  const setCachedData = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify({
      value,
      timestamp: Date.now()
    }));
  };

  const fetchUsersFromAPI = async () => {
    try {
      // Check cache first
      const cached = getCachedData('admin_users');
      if (cached) {
        setUsers(cached);
        return;
      }

      // Since we don't have a specific users endpoint, simulate with auth service
      // This is a temporary solution until backend admin endpoints are added
      const mockUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@yenilenebilir.enerji',
          role: 'Admin',
          isActive: true,
          createdAt: '2025-01-01',
          lastLoginAt: new Date().toISOString().split('T')[0]
        }
      ];
      
      setUsers(mockUsers);
      setCachedData('admin_users', mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPlantsFromAPI = async () => {
    try {
      // Check cache first
      const cached = getCachedData('admin_plants');
      if (cached) {
        setPlants(cached);
        return;
      }

      // Fetch from actual energy plants API
      const response = await fetch('http://localhost:5283/api/energy/plants', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        const plantsData = await response.json();
        // Map the API response to our interface
        const mappedPlants = plantsData.map((plant: any) => ({
          id: plant.id,
          name: plant.name,
          type: plant.type,
          capacity: plant.capacity,
          status: plant.status || 'active',
          latitude: plant.latitude,
          longitude: plant.longitude,
          lastUpdated: plant.lastUpdated || new Date().toISOString().split('T')[0]
        }));
        
        setPlants(mappedPlants);
        setCachedData('admin_plants', mappedPlants);
      } else {
        // Fallback to mock data if API fails
        const mockPlants = [
          {
            id: 1,
            name: 'Karapınar GES',
            type: 'Solar',
            capacity: 1350,
            status: 'active',
            latitude: 37.7144,
            longitude: 33.5506,
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            id: 2,
            name: 'Çanakkale RES',
            type: 'Wind',
            capacity: 1320,
            status: 'active',
            latitude: 40.1553,
            longitude: 26.4142,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        ];
        setPlants(mockPlants);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      // Use cached data as fallback
      const cached = getCachedData('admin_plants');
      if (cached) {
        setPlants(cached);
      }
    }
  };

  const refreshData = async () => {
    setLoading(true);
    // Clear cache
    localStorage.removeItem('admin_users');
    localStorage.removeItem('admin_plants');
    
    await Promise.all([
      fetchUsersFromAPI(),
      fetchPlantsFromAPI()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUsersFromAPI(),
        fetchPlantsFromAPI()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const searchAddress = async (address: string) => {
    try {
      // OpenStreetMap Nominatim API kullanarak adres arama
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=tr&limit=5`);
      const data = await response.json();
      return data.map((item: any) => ({
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Address search error:', error);
      return [];
    }
  };

  const searchNearbyPlants = async (address: string) => {
    try {
      const locations = await searchAddress(address);
      if (locations.length > 0) {
        const location = locations[0];
        setSearchLocation({ lat: location.latitude, lon: location.longitude });
        
        // Backend'den yakındaki santralleri çek
        const response = await fetch(`http://localhost:5283/api/energy/nearby/${location.latitude}/${location.longitude}?radiusKm=50`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        if (response.ok) {
          const nearbyPlantsData = await response.json();
          
          // Zaten ekli olanları filtrele
          const existingPlantNames = plants.map(p => p.name.toLowerCase());
          const filteredPlants = nearbyPlantsData.filter((plant: EnergyPlant) => 
            !existingPlantNames.includes(plant.name.toLowerCase())
          );
          
          setNearbyPlants(filteredPlants);
          setShowNearbyPlants(true);
        }
      }
    } catch (error: any) {
      console.error('Error searching nearby plants:', error);
      alert(`Santral arama hatası: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleAddPlant = async () => {
    try {
      if (!newPlant.name || !newPlant.capacity || !newPlant.latitude || !newPlant.longitude) {
        alert('Lütfen tüm alanları doldurun');
        return;
      }

      const plantData = {
        name: newPlant.name,
        type: newPlant.type,
        capacity: parseInt(newPlant.capacity),
        latitude: parseFloat(newPlant.latitude),
        longitude: parseFloat(newPlant.longitude)
      };

      // Backend'e gerçek API çağrısı
      const response = await fetch('http://localhost:5283/api/energy/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(plantData)
      });

      if (response.ok) {
        const newPlantFromAPI = await response.json();
        
        // Local state'i güncelle
        const updatedPlants = [...plants, newPlantFromAPI];
        setPlants(updatedPlants);
        
        // Cache'i güncelle
        setCachedData('admin_plants', updatedPlants);
        
        // Formu temizle
        setNewPlant({
          name: '',
          type: 'Solar',
          capacity: '',
          latitude: '',
          longitude: '',
          address: ''
        });
        setShowAddPlant(false);
        
        alert('Tesis başarıyla eklendi!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API hatası');
      }
    } catch (error: any) {
      console.error('Error adding plant:', error);
      alert(`Tesis eklenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleSelectExistingPlant = async (selectedPlant: EnergyPlant) => {
    try {
      // Seçilen santrali kendi veritabanımıza ekle
      const response = await fetch('http://localhost:5283/api/energy/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          name: selectedPlant.name,
          type: selectedPlant.type,
          capacity: selectedPlant.capacity,
          latitude: selectedPlant.latitude,
          longitude: selectedPlant.longitude
        })
      });

      if (response.ok) {
        const newPlantData = await response.json();
        setPlants([...plants, newPlantData]);
        setCachedData('admin_plants', [...plants, newPlantData]);
        
        setShowNearbyPlants(false);
        setShowAddPlant(false);
        alert(`${selectedPlant.name} başarıyla eklendi!`);
      } else {
        throw new Error('Santral eklenemedi');
      }
    } catch (error: any) {
      console.error('Error adding existing plant:', error);
      alert(`Santral eklenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleAddressSelect = (location: any) => {
    setNewPlant(prev => ({
      ...prev,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      address: location.name
    }));
  };

  const convertTypeToString = (type: string | number): string => {
    if (typeof type === 'number') {
      switch (type) {
        case 0: return 'solar';
        case 1: return 'wind';
        case 2: return 'geothermal';
        default: return 'solar';
      }
    }
    return type.toLowerCase();
  };

  const getPlantTypeIcon = (type: string | number) => {
    const typeStr = convertTypeToString(type);
    switch (typeStr) {
      case 'solar': return faLeaf;
      case 'wind': return faWind;
      case 'geothermal': return faFire;
      default: return faBolt;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400';
      case 'maintenance': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Enerji Santrali</p>
              <p className="text-3xl font-bold">{plants.length}</p>
            </div>
            <FontAwesomeIcon icon={faBolt} className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Toplam Kapasite</p>
              <p className="text-3xl font-bold">{plants.reduce((sum, plant) => sum + plant.capacity, 0)} MW</p>
            </div>
            <FontAwesomeIcon icon={faChartLine} className="text-4xl text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Aktif Santral</p>
              <p className="text-3xl font-bold">{plants.filter(p => p.status === 'Active').length}</p>
            </div>
            <FontAwesomeIcon icon={faDatabase} className="text-4xl text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Son Aktiviteler</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Yeni kullanıcı kaydı: jane@example.com</p>
              <p className="text-gray-400 text-sm">2 saat önce</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">İzmir Jeotermal Santrali bakıma alındı</p>
              <p className="text-gray-400 text-sm">5 saat önce</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Sistem güncellemesi tamamlandı</p>
              <p className="text-gray-400 text-sm">1 gün önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Yeni Kullanıcı
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300">
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            Verileri Yenile
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300">
          <FontAwesomeIcon icon={faUsers} className="mr-2" />
          Filtrele
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-white font-medium">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-white font-medium">Rol</th>
                <th className="px-6 py-4 text-left text-white font-medium">Durum</th>
                <th className="px-6 py-4 text-left text-white font-medium">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-left text-white font-medium">Son Giriş</th>
                <th className="px-6 py-4 text-left text-white font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <tr key={user.id} className="hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <FontAwesomeIcon icon={faUserShield} className="mr-1" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{user.createdAt}</td>
                  <td className="px-6 py-4 text-gray-300">{user.lastLoginAt || 'Hiç giriş yapmadı'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors duration-200">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlants = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-white">Enerji Santrali Yönetimi</h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddPlant(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Yeni Santral
          </button>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            Verileri Yenile
          </button>
        </div>
      </div>

      {/* Plants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <div key={plant.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={getPlantTypeIcon(plant.type)} className="text-2xl text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{plant.name}</h3>
                  <p className="text-gray-400 text-sm">{convertTypeToString(plant.type) === 'solar' ? 'Güneş' : convertTypeToString(plant.type) === 'wind' ? 'Rüzgar' : 'Jeotermal'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="text-red-400 hover:text-red-300 transition-colors duration-200">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Kapasite:</span>
                <span className="text-white font-medium">{plant.capacity} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Durum:</span>
                <span className={`font-medium ${getStatusColor(plant.status)}`}>{plant.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Konum:</span>
                <span className="text-white text-sm">{plant.latitude.toFixed(2)}, {plant.longitude.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Son Güncelleme:</span>
                <span className="text-white text-sm">{plant.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plant Modal */}
      {showAddPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Yeni Enerji Santrali Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Santral Adı</label>
                <input
                  type="text"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: İstanbul Güneş Santrali"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Tür</label>
                <select
                  value={newPlant.type}
                  onChange={(e) => setNewPlant(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Solar">Güneş (Solar)</option>
                  <option value="Wind">Rüzgar (Wind)</option>
                  <option value="Geothermal">Jeotermal (Geothermal)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Kapasite (MW)</label>
                <input
                  type="number"
                  value={newPlant.capacity}
                  onChange={(e) => setNewPlant(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Adres Ara</label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={newPlant.address}
                      onChange={(e) => setNewPlant(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İl, ilçe veya adres girin..."
                    />
                    <button
                      onClick={async () => {
                        if (newPlant.address) {
                          const locations = await searchAddress(newPlant.address);
                          if (locations.length > 0) {
                            handleAddressSelect(locations[0]);
                          }
                        }
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (newPlant.address) {
                          searchNearbyPlants(newPlant.address);
                        } else {
                          alert('Lütfen önce konum girin');
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      📋 Bu Bölgedeki Yeni Eklenebilir Santralları Göster
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Enlem</label>
                  <input
                    type="number"
                    step="any"
                    value={newPlant.latitude}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="41.0082"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Boylam</label>
                  <input
                    type="number"
                    step="any"
                    value={newPlant.longitude}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="28.9784"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddPlant}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Santral Ekle
              </button>
              <button
                onClick={() => setShowAddPlant(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Plants Modal */}
      {showNearbyPlants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                🏭 Bu Bölgedeki Yeni Santrallar ({nearbyPlants.length} adet)
              </h3>
              <p className="text-sm text-gray-400">50 km yarıçapında • Zaten ekli olanlar gizli</p>
              <button
                onClick={() => setShowNearbyPlants(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {nearbyPlants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyPlants.map((plant, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-white">{plant.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(plant.status)}`}>
                        {plant.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon 
                          icon={getPlantTypeIcon(plant.type)} 
                          className="text-blue-400" 
                        />
                        <span>{convertTypeToString(plant.type) === 'solar' ? 'Güneş' : convertTypeToString(plant.type) === 'wind' ? 'Rüzgar' : 'Jeotermal'}</span>
                      </div>
                      <div>⚡ Kapasite: {plant.capacity} MW</div>
                      <div>📍 Konum: {plant.latitude.toFixed(4)}, {plant.longitude.toFixed(4)}</div>
                      <div>📅 Güncellenme: {new Date(plant.lastUpdated).toLocaleDateString('tr-TR')}</div>
                    </div>
                    
                    <button
                      onClick={() => handleSelectExistingPlant(plant)}
                      className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✅ Bu Santrali Sisteme Ekle
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">Bu bölgede yeni eklenebilir santral bulunamadı</p>
                <p className="text-gray-500 text-sm mt-2">
                  • 50 km yarıçapında santral yok<br/>
                  • Ya da tüm santrallar zaten sisteminizde kayıtlı<br/>
                  • Farklı bir konum deneyin
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Sistem Ayarları</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Genel Ayarlar</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Site Başlığı</label>
              <input
                type="text"
                defaultValue="Yenilenebilir Enerji"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">API Zaman Aşımı (saniye)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance"
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="maintenance" className="ml-2 text-gray-300">Bakım Modu</label>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Güvenlik Ayarları</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Token Geçerlilik Süresi (dakika)</label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Maksimum Giriş Denemesi</label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactor"
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="twoFactor" className="ml-2 text-gray-300">İki Faktörlü Doğrulama</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">YE</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-gray-800 rounded-xl p-4">
              <ul className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: faChartLine },
                  { id: 'users', label: 'Kullanıcılar', icon: faUsers },
                  { id: 'plants', label: 'Enerji Santralleri', icon: faBolt },
                  { id: 'settings', label: 'Ayarlar', icon: faCog }
                ].map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <FontAwesomeIcon icon={tab.icon} />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'plants' && renderPlants()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 