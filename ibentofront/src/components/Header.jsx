import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import {
  HomeIcon as HomeOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftIcon as ChatOutline,
  FaceSmileIcon as FaceSmileOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  UserIcon as UserSolid,
  ChatBubbleLeftIcon as ChatSolid,
  FaceSmileIcon as FaceSmileSolid,
} from "@heroicons/react/24/solid";

import { BellDot, Search, Bell, Sparkles, Zap, Heart, TrendingUp } from 'lucide-react';
import { useUserNotifications } from '../hooks/useNotificationSidebar';
import NotificationSidebar from './eventos/components/NotificationsSidebar';

// Función para obtener el saludo según la hora
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
};

function Header() {
  const navigate = useNavigate();
  const [usuarioName, setUsuarioName] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const token = localStorage.getItem("access") ?? "";
  const {
    notifications,
    loading: notifLoading,
    error: notifError,
    unreadCount,
    markAsRead,
    fetchNotifications
  } = useUserNotifications(token);

  const handleSidebarOpen = () => {
    setVisible(true);
    fetchNotifications?.();
  };

  const handleSidebarClose = () => {
    setVisible(false);
  };

  // Efecto para refrescar notificaciones periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetchNotifications) {
        fetchNotifications();
      }
    }, 30000); // Refrescar cada 30 segundos

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listener para eventos de notificación del service worker
  useEffect(() => {
    const handleNotificationEvent = () => {
      if (fetchNotifications) {
        fetchNotifications();
      }
    };

    window.addEventListener('notification:like', handleNotificationEvent);
    window.addEventListener('notification:match', handleNotificationEvent);
    window.addEventListener('notification:message', handleNotificationEvent);

    return () => {
      window.removeEventListener('notification:like', handleNotificationEvent);
      window.removeEventListener('notification:match', handleNotificationEvent);
      window.removeEventListener('notification:message', handleNotificationEvent);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userObject = JSON.parse(userString);
      const nombre = userObject.nombre;
      setUsuarioName(nombre);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);
  const navItems = [
    { 
      path: '/ibento/eventos', 
      label: 'Eventos',
      OutlineIcon: HomeOutline, 
      SolidIcon: HomeSolid
    },
    { 
      path: '/ibento/matches', 
      label: 'Matches',
      OutlineIcon: FaceSmileOutline, 
      SolidIcon: FaceSmileSolid
    },
    { 
      path: '/ibento/match', 
      label: 'Chat',
      OutlineIcon: ChatOutline, 
      SolidIcon: ChatSolid
    },
    { 
      path: '/ibento/perfil', 
      label: 'Perfil',
      OutlineIcon: UserOutline, 
      SolidIcon: UserSolid
    }
  ];

  const gradient = 'from-blue-500 to-purple-600';
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 pt-2">
            {/* Avatar y saludo */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <img 
                  src="/icons/ibento.png" 
                  alt="Perfil" 
                  className="w-14 h-14 rounded-2xl object-cover shadow-xl border-3 border-white ring-4 ring-purple-100 transition-transform hover:scale-105" 
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm font-medium tracking-wide">{getGreeting()}</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent leading-tight">
                  {usuarioName || 'Usuario'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/ibento/eventos'}
                  className="relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group"
                >
                  {({ isActive }) => (
                    <>
                      <div className={`
                        flex items-center justify-center w-6 h-6 transition-all duration-200
                        ${isActive 
                          ? 'text-blue-600' 
                          : 'text-gray-500 group-hover:text-gray-700'
                        }
                      `}>
                        {isActive ? (
                          <item.SolidIcon className="w-6 h-6" />
                        ) : (
                          <item.OutlineIcon className="w-6 h-6" />
                        )}
                      </div>
                      
                      <span className={`
                        font-medium transition-all duration-200
                        ${isActive 
                          ? 'text-blue-600' 
                          : 'text-gray-700 group-hover:text-gray-900'
                        }
                      `}>
                        {item.label}
                      </span>
                      
                      {isActive && (
                        <div className={`
                          absolute bottom-0 left-1/2 transform -translate-x-1/2
                          w-8 h-0.5 bg-gradient-to-r ${gradient} rounded-full
                        `}></div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Acciones del header */}
            <div className="flex items-center space-x-3">
              {/* Botón de búsqueda premium */}
              <button
                onClick={() => navigate('/ibento/busqueda')}
                className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <Search className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>

              {/* Notificaciones premium */}
              <div className="relative">
                <button
                  onClick={handleSidebarOpen}
                  className={`
                    relative p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 group
                    ${unreadCount > 0
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg hover:shadow-xl'
                      : 'bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  <Bell className={`
                    w-5 h-5 transition-all duration-300
                    ${unreadCount > 0 
                      ? 'text-white animate-swing' 
                      : 'text-gray-600 group-hover:text-purple-600'
                    }
                  `} />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full min-w-[20px] h-[20px] shadow-lg animate-bounce border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl animate-ping opacity-75 -z-10"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar de Notificaciones */}
      <NotificationSidebar
        visible={visible}
        onHide={handleSidebarClose}
        notifications={notifications}
        loading={notifLoading}
        error={notifError}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
      />
    </>
  );
}

export default Header;
