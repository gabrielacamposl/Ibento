import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MapPin, Calendar } from 'lucide-react';

// Función para obtener el saludo según la hora
const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Madrugada perfecta', emoji: '🌙', subtitle: 'para eventos únicos' };
    if (hour < 12) return { text: 'Buenos días', emoji: '☀️', subtitle: 'descubre algo nuevo' };
    if (hour < 18) return { text: 'Buenas tardes', emoji: '🌅', subtitle: 'es hora de conectar' };
    if (hour < 22) return { text: 'Buenas noches', emoji: '🌆', subtitle: 'vive la experiencia' };
    return { text: 'Noche perfecta', emoji: '✨', subtitle: 'para aventuras' };
};

function HeroSection() {
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
      setCurrentTime(new Date());
    };

    // Actualizar cada minuto
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { icon: TrendingUp, label: 'Eventos populares', value: '250+' },
    { icon: MapPin, label: 'Ubicaciones', value: '50+' },
    { icon: Calendar, label: 'Esta semana', value: '80+' },
  ];

  return (
    <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-indigo-50/40 border-b border-white/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 xl:px-8 py-12">
        <div className="flex items-center justify-between">
          
          {/* Saludo y Información Principal */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl animate-bounce">{greeting.emoji}</span>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  {greeting.text}
                </h2>
                <p className="text-gray-600 font-medium">{greeting.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">
                  {currentTime.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </p>
              <p className="text-gray-500">
                Descubre eventos increíbles y conecta con personas que comparten tus intereses
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex space-x-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-4 hover:bg-white/80 transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="hidden xl:block">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-purple-300 to-transparent"></div>
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse delay-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
    </div>
  );
}

export default HeroSection;
