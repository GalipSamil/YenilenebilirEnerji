import React, { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Yüksek Verimlilik',
      message: 'Güneş panelleri maksimum verimde çalışıyor',
      type: 'success',
      timestamp: new Date(),
      read: false
    },
    {
      id: 2,
      title: 'Bakım Uyarısı',
      message: 'Rüzgar türbini #5 bakım zamanı yaklaşıyor',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    }
  ]);

  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400 border-green-400 bg-green-400/10';
      case 'warning':
        return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'error':
        return 'text-red-400 border-red-400 bg-red-400/10';
      default:
        return 'text-blue-400 border-blue-400 bg-blue-400/10';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) {
      return `${minutes} dakika önce`;
    } else if (hours < 24) {
      return `${hours} saat önce`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed top-20 right-5 z-50 w-auto md:w-[350px]">
      <div
        className="bg-white/5 backdrop-blur-lg rounded-xl p-4 cursor-pointer border border-white/10 flex items-center gap-3 hover:scale-105 transition-transform"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative text-2xl">
          🔔
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
        {!isExpanded && (
          <span className="text-white">Bildirimler</span>
        )}
      </div>

      {isExpanded && (
        <div
          className="mt-3 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 max-h-[500px] overflow-y-auto transition-all duration-300 opacity-100"
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Bildirimler</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              Bildirim bulunmuyor
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`m-3 p-4 rounded-lg cursor-pointer relative transition-all duration-300 hover:scale-105 ${
                    getTypeStyles(notification.type)
                  } ${notification.read ? 'opacity-70' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">
                      {notification.title}
                    </h4>
                    <small className="text-gray-400">
                      {formatTime(notification.timestamp)}
                    </small>
                  </div>
                  <p className="text-gray-300">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-400' :
                        notification.type === 'warning' ? 'bg-yellow-400' :
                        notification.type === 'error' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 