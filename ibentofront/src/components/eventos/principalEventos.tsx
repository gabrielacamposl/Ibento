import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellDot, Search, Bell, Sparkles, Zap, Heart, TrendingUp } from 'lucide-react';

import Carousel from './components/carousel';
import Cards from './components/cards';
import SearchMenu from './components/menu';
import CircularDemo from './components/carousel2';
import NotificationSidebar from './components/NotificationsSidebar';
import HeroSection from '../HeroSection';

import LoadingSpinner from './../../assets/components/LoadingSpinner';

import { useFetchEvents, useFetchRecommendedEvents } from '../../hooks/usefetchEvents';
import { useUserNotifications } from '../../hooks/useNotificationSidebar';
import useIsWebVersion from '../../hooks/useIsWebVersion';

// Función para obtener el saludo según la hora
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
};

function Page() {
    const navigate = useNavigate();
    const [usuarioName, setUsuarioName] = useState('');
    const [visible, setVisible] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const isWebVersion = useIsWebVersion();

    const token = localStorage.getItem("access") ?? "";
    const {
        notifications,
        loading: notifLoading,
        error: notifError,
        unreadCount,
        markAsRead,
        fetchNotifications
    } = useUserNotifications(token);    const { data: popularEvents, loading: popularLoading, error: popularError } = useFetchEvents('eventos/most_liked/');
    const { data: recommendedEvents, loading: recommendedLoading, error: recommendedError } = useFetchRecommendedEvents('eventos/recommended_events', token);

    const handleSidebarOpen = () => {
        setVisible(true);
        // Opcionalmente refrescar notificaciones cuando se abre
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

        // Escuchar eventos personalizados de notificación
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
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const userString = localStorage.getItem("user");
        if (userString) {
            const userObject = JSON.parse(userString);
            const nombre = userObject.nombre;
            setUsuarioName(nombre);
        }
    }, []);        if (popularLoading || recommendedLoading) {
        return (
            <LoadingSpinner
                loadingText="Cargando eventos"
            />
        );
    }

    if (popularError || recommendedError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ups, algo salió mal</h3>
                    <p className="text-gray-600 mb-4">No pudimos cargar los eventos en este momento</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }    return (
        <div className="min-h-screen bg-gradient-to-br lg:w-full from-slate-50 via-purple-50/30 to-pink-50/30 relative overflow-hidden">
            {/* Hero Section - Solo visible en pantallas grandes */}
            <HeroSection />
            
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-300/10 to-yellow-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Header Premium - Solo en versión móvil */}
            <div className="lg:hidden relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
                    <div className="flex w-full items-center h-24 px-6 pt-2">
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

                        {/* Acciones del header */}
                        <div className="flex items-center space-x-3">
                            {/* Botón de búsqueda premium */}
                            <button
                                onClick={() => navigate('../busqueda')}
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
                </div>            {/* Contenido principal */}
            <div className={`relative z-10 pb-24 lg:pb-8 ${isWebVersion ? 'pt-4' : ''}`}>
                {/* Quick Stats Cards */}
                <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Populares</p>
                                    <p className="text-lg font-bold text-gray-900">{popularEvents?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Para ti</p>
                                    <p className="text-lg font-bold text-gray-900">{recommendedEvents?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secciones de contenido */}
                <div className="space-y-8">
                    {/* Carousel principal */}
                    <div className="px-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-1 border border-white/40 shadow-xl">
                            <CircularDemo listEvents={popularEvents}/>
                        </div>
                    </div>

                    {/* Cards de eventos populares */}
                    <div className="space-y-4">
                        <div className="px-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Populares
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-purple-300 to-pink-300 opacity-30"></div>
                            </div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm border-t border-white/40 shadow-lg">
                            <Cards listEvents={popularEvents} name="Populares" />
                        </div>
                    </div>

                    {/* Cards de eventos recomendados */}
                    <div className="space-y-4">
                        <div className="px-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    Recomendados para ti
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-orange-300 to-yellow-300 opacity-30"></div>
                            </div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm border-t border-white/40 shadow-lg">
                            <Cards listEvents={recommendedEvents} name="Recomendados para ti" />
                        </div>
                    </div>

                    {/* Menu de búsqueda */}
                    <div className="px-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl overflow-hidden">
                            <SearchMenu />
                        </div>
                    </div>
                </div>

                {/* Espaciado inferior */}
                <div className="h-8"></div>
            </div>            {/* Sidebar de Notificaciones - Solo en versión móvil */}
            {/* {!isWebVersion && ( */}
                <NotificationSidebar
                    visible={visible}
                    onHide={handleSidebarClose}
                    notifications={notifications}
                    loading={notifLoading}
                    error={notifError}
                    unreadCount={unreadCount}
                    markAsRead={markAsRead}
                />
            {/* )} */}
        </div>
    );
}

export default Page;