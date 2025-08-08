import React, { useState, useEffect } from 'react';

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  saving: string;
}

const tips: Tip[] = [
  {
    id: 1,
    title: 'Güneş Enerjisi İpucu',
    description: 'Güneş panellerinizi düzenli olarak temizleyerek verimini %15\'e kadar artırabilirsiniz.',
    icon: '☀️',
    color: 'yellow',
    saving: '15%'
  },
  {
    id: 2,
    title: 'Rüzgar Enerjisi İpucu',
    description: 'Rüzgar türbinlerinizin bakımını düzenli yaparak enerji üretimini %20 artırabilirsiniz.',
    icon: '💨',
    color: 'blue',
    saving: '20%'
  },
  {
    id: 3,
    title: 'Jeotermal Enerji İpucu',
    description: 'Jeotermal sistemlerinizi optimize ederek enerji verimliliğini %25 artırabilirsiniz.',
    icon: '🔥',
    color: 'red',
    saving: '25%'
  },
  {
    id: 4,
    title: 'Genel Enerji İpucu',
    description: 'Enerji depolama sistemlerini kullanarak fazla enerjiyi saklayın ve ihtiyaç anında kullanın.',
    icon: '⚡',
    color: 'green',
    saving: '30%'
  }
];

const EnergySavingTips: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentTip = tips[currentTipIndex];

  const getGradientClasses = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'from-yellow-400 to-yellow-600';
      case 'blue':
        return 'from-blue-400 to-blue-600';
      case 'red':
        return 'from-red-400 to-red-600';
      case 'green':
        return 'from-green-400 to-green-600';
      default:
        return 'from-primary-400 to-secondary-400';
    }
  };

  return (
    <div className="relative rounded-2xl">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getGradientClasses(currentTip.color)} rounded-2xl blur opacity-50`}></div>
      <div className="relative bg-gray-900 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className={`text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r ${getGradientClasses(currentTip.color)}`}>
            Enerji Tasarrufu İpuçları
          </h3>
          <div className="flex gap-1">
            {tips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTipIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className={`transform transition-all duration-500 ${
          isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientClasses(currentTip.color)} bg-opacity-10 flex items-center justify-center text-2xl`}>
              {currentTip.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white">{currentTip.title}</h4>
              <p className="text-sm text-gray-400">{currentTip.description}</p>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${getGradientClasses(currentTip.color)} rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500`}></div>
            <div className="relative bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-400">Potansiyel Tasarruf</span>
              <span className="text-2xl font-bold text-green-400">{currentTip.saving}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center text-sm">
            <button
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
                  setIsAnimating(false);
                }, 500);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Önceki İpucu
            </button>
            <button
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentTipIndex((prev) => (prev + 1) % tips.length);
                  setIsAnimating(false);
                }, 500);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sonraki İpucu →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergySavingTips; 