import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faWind, faFire } from '@fortawesome/free-solid-svg-icons';
import { solarService, windService, geothermalService } from '../services/api';

interface Plant {
  id: number;
  name: string;
  type: string;
  capacity: string;
  efficiency: number;
  dailyProduction: number;
  status: string;
}

interface PlantsListProps {
  type?: string;
}

const PlantsList: React.FC<PlantsListProps> = ({ type }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        
        // Gerçek API çağrıları
        if (type === 'solar') {
          const response = await solarService.getSolarProduction();
          const solarData = response.data?.results || [];
          const formattedPlants = solarData.map((region: any, index: number) => ({
            id: index + 1,
            name: `${region.region} GES`,
            type: 'solar',
            capacity: (parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000).toFixed(1),
            efficiency: Math.round(Math.random() * 20 + 80), // %80-100 arası
            dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000,
            status: 'active'
          }));
          setPlants(formattedPlants);
        } else if (type === 'wind') {
          const response = await windService.getWindProduction();
          const windData = response.data?.results || [];
          const formattedPlants = windData.map((region: any, index: number) => ({
            id: index + 1,
            name: `${region.region} RES`,
            type: 'wind',
            capacity: (parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000).toFixed(1),
            efficiency: Math.round(Math.random() * 15 + 75), // %75-90 arası
            dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000,
            status: 'active'
          }));
          setPlants(formattedPlants);
        } else if (type === 'geothermal') {
          const response = await geothermalService.getGeothermalProduction();
          const geothermalData = response.data?.results || [];
          const formattedPlants = geothermalData.map((region: any, index: number) => ({
            id: index + 1,
            name: `${region.region} JES`,
            type: 'geothermal',
            capacity: (parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000).toFixed(1),
            efficiency: Math.round(Math.random() * 10 + 85), // %85-95 arası
            dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000,
            status: 'active'
          }));
          setPlants(formattedPlants);
        } else {
          // Tüm santralleri getir
          const [solarResponse, windResponse, geothermalResponse] = await Promise.all([
            solarService.getSolarProduction(),
            windService.getWindProduction(),
            geothermalService.getGeothermalProduction()
          ]);
          
          const allPlants: Plant[] = [];
          
          // Solar santraller
          const solarData = solarResponse.data?.results || [];
          solarData.forEach((region: any, index: number) => {
            allPlants.push({
              id: index + 1,
              name: `${region.region} GES`,
              type: 'solar',
              capacity: (parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000).toFixed(1),
              efficiency: Math.round(Math.random() * 20 + 80),
              dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000,
              status: 'active'
            });
          });
          
          // Rüzgar santraller
          const windData = windResponse.data?.results || [];
          windData.forEach((region: any, index: number) => {
            allPlants.push({
              id: solarData.length + index + 1,
              name: `${region.region} RES`,
              type: 'wind',
              capacity: (parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000).toFixed(1),
              efficiency: Math.round(Math.random() * 15 + 75),
              dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000,
              status: 'active'
            });
          });
          
          // Jeotermal santraller
          const geothermalData = geothermalResponse.data?.results || [];
          geothermalData.forEach((region: any, index: number) => {
            allPlants.push({
              id: solarData.length + windData.length + index + 1,
              name: `${region.region} JES`,
              type: 'geothermal',
              capacity: (parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000).toFixed(1),
              efficiency: Math.round(Math.random() * 10 + 85),
              dailyProduction: parseFloat(region.dailyProduction?.replace(' kWh', '') || '0') / 1000,
              status: 'active'
            });
          });
          
          setPlants(allPlants);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [type]);

  const getIcon = (plantType: string) => {
    switch(plantType) {
      case 'solar':
        return { icon: faSun, color: '#FFB800' };
      case 'wind':
        return { icon: faWind, color: '#00B4D8' };
      case 'geothermal':
        return { icon: faFire, color: '#FF5722' };
      default:
        return { icon: faSun, color: '#4CAF50' };
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Veriler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button 
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {plants.map((plant, index) => {
          const { icon, color } = getIcon(plant.type);
          return (
            <div 
              key={plant.id} 
              style={{
                ...styles.card,
                animation: `slideIn 0.5s ease forwards ${index * 0.1}s`,
                opacity: 0,
                transform: 'translateY(20px)',
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                
                const rotateY = ((x - rect.width / 2) / rect.width) * 10;
                const rotateX = ((y - rect.height / 2) / rect.height) * -10;
                
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
              }}
            >
              <div style={styles.cardGlow}></div>
              <div style={styles.cardBackground}></div>
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <div style={{...styles.iconContainer, backgroundColor: `${color}22`}}>
                    <FontAwesomeIcon icon={icon} style={{...styles.icon, color}} />
                  </div>
                  <h3 style={styles.plantName}>{plant.name}</h3>
                </div>
                
                <div style={styles.stats}>
                  <div style={styles.statItem}>
                    <span style={styles.label}>Kapasite</span>
                    <span style={styles.value}>{plant.capacity} MW</span>
                  </div>
                  
                  <div style={styles.statItem}>
                    <span style={styles.label}>Verimlilik</span>
                    <div style={styles.efficiencyBar}>
                      <div 
                        style={{
                          ...styles.efficiencyFill,
                          width: `${plant.efficiency}%`,
                          background: `linear-gradient(90deg, ${color}66, ${color})`,
                        }}
                      >
                        <div style={styles.efficiencyGlow}></div>
                      </div>
                    </div>
                    <span style={styles.value}>{plant.efficiency}%</span>
                  </div>
                  
                  <div style={styles.statItem}>
                    <span style={styles.label}>Günlük Üretim</span>
                    <span style={styles.value}>{plant.dailyProduction.toFixed(1)} MWh</span>
                  </div>
                </div>

                <div style={styles.status}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: plant.status === 'active' ? '#4CAF5022' : '#FFA72622',
                    color: plant.status === 'active' ? '#4CAF50' : '#FFA726',
                    border: `1px solid ${plant.status === 'active' ? '#4CAF5044' : '#FFA72644'}`,
                  }}>
                    {plant.status === 'active' ? 'Aktif' : 'Bakımda'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '25px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    transform: 'perspective(1000px) rotateX(0) rotateY(0)',
    transformStyle: 'preserve-3d',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    position: 'relative',
    zIndex: 2,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    borderRadius: '20px',
    transform: 'translateZ(-10px)',
    pointerEvents: 'none',
  },
  cardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)',
    borderRadius: '22px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '24px',
  },
  plantName: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '500',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
  },
  value: {
    fontWeight: '500',
  },
  efficiencyBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    margin: '0 10px',
    overflow: 'hidden',
  },
  efficiencyFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
    position: 'relative',
  },
  efficiencyGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20px',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.3)',
    filter: 'blur(5px)',
  },
  status: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '40px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1rem',
    margin: 0,
  },
  errorContainer: {
    padding: '40px',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF5722',
    marginBottom: '20px',
  },
  retryButton: {
    background: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    fontSize: '1rem',
    fontWeight: '500',
  },
};

// Add keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default PlantsList; 