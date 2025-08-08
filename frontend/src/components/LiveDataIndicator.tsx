import React from 'react';

interface LiveDataIndicatorProps {
  lastUpdate: Date;
}

const LiveDataIndicator: React.FC<LiveDataIndicatorProps> = ({ lastUpdate }) => {
  const getTimeDifference = () => {
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds} saniye önce`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    return `${Math.floor(seconds / 3600)} saat önce`;
  };

  return (
    <div className="relative inline-flex group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative px-6 py-3 bg-gray-900 rounded-full leading-none flex items-center divide-x divide-gray-600">
        <div className="flex items-center space-x-3 pr-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-medium">Canlı Veri</span>
        </div>
        <div className="pl-6 text-gray-400 text-sm">
          Son güncelleme: {getTimeDifference()}
        </div>
      </div>
    </div>
  );
};

export default LiveDataIndicator; 