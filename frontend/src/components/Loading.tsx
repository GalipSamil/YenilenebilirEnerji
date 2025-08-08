import React from 'react';

const Loading: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999
    }}>
      <div className="loading-spinner" />
      <div style={{
        marginTop: '20px',
        fontSize: '1.2rem',
        color: 'white',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
      }}>
        Yükleniyor...
      </div>
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '80px'
      }}>
        <div style={{
          width: '50%',
          height: '100%',
          background: 'white',
          borderRadius: '2px',
          animation: 'loading 1.5s ease-in-out infinite'
        }} />
      </div>
      <style>
        {`
          @keyframes loading {
            0% {
              transform: translateX(-200%);
            }
            50% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-200%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loading; 