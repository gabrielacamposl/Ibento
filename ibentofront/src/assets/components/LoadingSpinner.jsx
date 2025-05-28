import React from 'react';

const LoadingSpinner = ({ logoSrc = '/ibento_logo.png', loadingText = 'Cargando' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center bg-white z-50">
      {/* Efectos de resplandor de fondo */}
      <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full opacity-10 -z-10 animate-pulse-glow bg-gradient-to-r from-blue-400/20 via-purple-500/10 to-transparent transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Spinner Wrapper */}
      <div className="relative flex justify-center items-center">
        {/* Círculo de carga externo con degradado */}
        <div className="absolute w-40 h-40 rounded-full animate-spin" style={{ top: '-20px', left: '-20px' }}>
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#spinnerGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="70 200"
              className="animate-spin"
            />
          </svg>
        </div>

        {/* Partículas orbitales */}
        <div className="absolute w-44 h-44" style={{ top: '-28px', left: '-28px' }}>
          {[0, 1, 2, 3].map((index) => {
            const positions = [
              { top: '0', left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', right: '0', transform: 'translateY(-50%)' },
              { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', left: '0', transform: 'translateY(-50%)' }
            ];
            
            return (
              <div
                key={index}
                className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                style={{
                  ...positions[index],
                  animation: `orbit 4s linear infinite ${index * -1}s`
                }}
              />
            );
          })}
        </div>

        {/* Logo central */}
        <div className="w-30 h-30 relative animate-logo-zoom">
          <img 
            src={logoSrc} 
            alt="Logo" 
            className="w-full h-full object-contain animate-logo-glow drop-shadow-md"
          />
        </div>
      </div>

      {/* Texto de carga */}
      <div className="text-gray-700 text-xl font-light tracking-widest uppercase animate-text-pulse">
        <span>{loadingText}</span>
        <span className="animate-dots">...</span>
      </div>

      <style jsx>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(90px) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: rotate(360deg) translateX(90px) rotate(-360deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
