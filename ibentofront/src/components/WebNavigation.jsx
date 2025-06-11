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

import { Bell, Search, Heart, Sparkles } from 'lucide-react';
import { useUserNotifications } from '../hooks/useNotificationSidebar';
import NotificationSidebar from './eventos/components/NotificationsSidebar';
import SideBar from './usuario/sidebar';
import api from '../api';

// Función para obtener el saludo según la hora
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
};

function WebNavigation() {
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

  // Obtener información del usuario
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (token) {
          const response = await api.get('usuarios/info_to_edit/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsuarioName(response.data.nombre || 'Usuario');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [token]);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleSidebarOpen = () => {
    setVisible(true);
    fetchNotifications?.();
  };

  const handleSidebarClose = () => {
    setVisible(false);
  };

  const navItems = [
    { 
      path: '/ibento/eventos', 
      label: 'Eventos',
      OutlineIcon: HomeOutline, 
      SolidIcon: HomeSolid,
      description: 'Descubre eventos'
    },
    { 
      path: '/ibento/matches', 
      label: 'Matches',
      OutlineIcon: FaceSmileOutline, 
      SolidIcon: FaceSmileSolid,
      description: 'Encuentra personas'
    },
    { 
      path: '/ibento/match', 
      label: 'Chat',
      OutlineIcon: ChatOutline, 
      SolidIcon: ChatSolid,
      description: 'Conversaciones'
    },
    { 
      path: '/ibento/perfil', 
      label: 'Perfil',
      OutlineIcon: UserOutline, 
      SolidIcon: UserSolid,
      description: 'Tu cuenta'
    }  ];

  const gradient = 'from-blue-500 to-purple-600';

  return (
    <>
      {/* Header Principal para Web */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-xl animate-slide-in-down">
        <div className="max-w-7xl mx-auto px-6 xl:px-8">
          <div className="flex items-center justify-between h-20">
              {/* Logo y Saludo del Usuario */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src="/icons/ibento.png" 
                    alt="Ibento" 
                    className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white ring-2 ring-purple-100 transition-transform hover:scale-110" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <div className="text-sm text-gray-500 font-medium">{getGreeting()}</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                    {usuarioName}
                  </div>
                </div>
              </div>
            </div>            {/* Navigation Principal */}
            <nav className="flex items-center space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/ibento/eventos'}
                  className="relative group"
                >
                  {({ isActive }) => (
                    <div className={`
                      flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-300 
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105' 
                        : 'hover:bg-white/60 hover:shadow-md'
                      }
                    `}>
                      <div className={`
                        flex items-center justify-center w-6 h-6 transition-all duration-200
                        ${isActive 
                          ? 'text-white' 
                          : 'text-gray-500 group-hover:text-purple-600'
                        }
                      `}>
                        {isActive ? (
                          <item.SolidIcon className="w-5 h-5" />
                        ) : (
                          <item.OutlineIcon className="w-5 h-5" />
                        )}
                      </div>
                      
                      <span className={`
                        font-semibold text-sm transition-all duration-200
                        ${isActive 
                          ? 'text-white' 
                          : 'text-gray-700 group-hover:text-gray-900'
                        }
                      `}>
                        {item.label}
                      </span>

                      {/* Efecto de brillo */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>            {/* Sección de Acciones */}
            <div className="flex items-center space-x-4">
              {/* Divider */}
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>              {/* Acciones */}
              <div className="flex items-center space-x-3">
                {/* Búsqueda */}
                <button
                  onClick={() => navigate('/ibento/busqueda')}
                  className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                  title="Buscar eventos"
                >
                  <Search className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>

                {/* Notificaciones */}
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
                    title="Notificaciones"
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
                </div>                {/* Configuración/Menú - Solo en versión web */}
                <div className="hidden lg:block">
                  <SideBar isWebVersion={true} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea decorativa con gradiente */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
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

export default WebNavigation;
