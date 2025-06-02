import React from 'react';

const LoadingSpinner = ({ loadingText = 'Cargando' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center z-50 overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-pink-400 to-purple-500 animate-gradient">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
        {/* Spinner principal */}
        <div className="relative flex justify-center items-center mb-6">
          {/* Anillos concéntricos */}
          <div className="absolute w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-2 rounded-full border-4 border-white/30 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-4 border-white/40 animate-spin-reverse"></div>
          </div>

          {/* Círculo de progreso principal */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#primaryGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="280"
                strokeDashoffset="70"
                className="animate-spin"
              />
            </svg>
          </div>

          {/* Elemento central animado */}
          <div className="absolute w-16 h-16 flex items-center justify-center">
            <div className="relative">
              {/* Puntos orbitales */}
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const angle = (index * 60) - 90;
                const x = Math.cos((angle * Math.PI) / 180) * 20;
                const y = Math.sin((angle * Math.PI) / 180) * 20;
                
                return (
                  <div
                    key={index}
                    className="absolute w-2 h-2 bg-white rounded-full shadow-lg"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      animation: `pulse 2s ease-in-out infinite ${index * 0.2}s`
                    }}
                  />
                );
              })}
              
              {/* Centro brillante */}
              <div className="w-6 h-6 bg-white rounded-full shadow-2xl animate-pulse flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Partículas flotantes */}
          {[...Array(8)].map((_, index) => {
            const delay = index * 0.5;
            const size = Math.random() * 4 + 2;
            const distance = Math.random() * 60 + 40;
            
            return (
              <div
                key={index}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  animation: `float 4s ease-in-out infinite ${delay}s`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${Math.cos((index * 45) * Math.PI / 180) * distance}px, ${Math.sin((index * 45) * Math.PI / 180) * distance}px)`,
                  width: `${size}px`,
                  height: `${size}px`
                }}
              />
            );
          })}
        </div>

        {/* Texto de carga estilizado */}
        <div className="text-center">
          <div className="text-white text-lg font-semibold mb-2 tracking-wide">
            {loadingText}
          </div>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
          </div>
        </div>      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px);
            opacity: 0.4;
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-20px);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
