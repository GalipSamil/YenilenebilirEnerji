import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icon setup
const defaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface EnergyMapProps {
  selectedType?: 'solar' | 'wind' | 'geothermal';
}

const EnergyMap: React.FC<EnergyMapProps> = ({ selectedType }) => {
  const markers = [
    { type: 'solar', position: [37.8719, 32.4843], name: 'Konya GES' },
    { type: 'wind', position: [39.7667, 26.6167], name: 'Çanakkale RES' },
    { type: 'wind', position: [37.1833, 36.7333], name: 'Nurdağı RES-1' },
    { type: 'wind', position: [37.1667, 36.7500], name: 'Nurdağı RES-2' },
    { type: 'wind', position: [37.2000, 36.7167], name: 'Nurdağı RES-3' },
    { type: 'geothermal', position: [38.4192, 28.1461], name: 'Manisa JES' }
  ];

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'solar':
        return '#FFD700';
      case 'wind':
        return '#00BCD4';
      case 'geothermal':
        return '#FF5722';
      default:
        return '#757575';
    }
  };

  const filteredMarkers = selectedType 
    ? markers.filter(marker => marker.type === selectedType)
    : markers;

  return (
    <MapContainer
      center={[38.5, 32.0]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {filteredMarkers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position as L.LatLngExpression}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              width: 25px;
              height: 25px;
              background-color: ${getMarkerColor(marker.type)};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
            "></div>`,
          })}
        >
          <Popup>
            <div style={{ padding: '10px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: getMarkerColor(marker.type) }}>
                {marker.name}
              </h3>
              <p style={{ margin: '0' }}>
                Tür: {marker.type === 'solar' ? 'Güneş' : marker.type === 'wind' ? 'Rüzgar' : 'Jeotermal'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default EnergyMap; 