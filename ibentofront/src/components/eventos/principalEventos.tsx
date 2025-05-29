import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellDot, Search, Bell } from 'lucide-react';

import Carousel from './components/carousel';
import Cards from './components/cards';
import SearchMenu from './components/menu';
import CircularDemo from './components/carousel2';
import NotificationSidebar from './components/NotificationsSidebar';

import LoadingSpinner from './../../assets/components/LoadingSpinner';

import { useFetchEvents, useFetchRecommendedEvents } from '../../hooks/usefetchEvents';
import { useUserNotifications } from '../../hooks/useNotificationSidebar';

function Page() {
    const navigate = useNavigate();
    const [usuarioName, setUsuarioName] = useState('');
    const [visible, setVisible] = useState(false);

    const token = localStorage.getItem("access") ?? "";
    const {
        notifications,
        loading: notifLoading,
        error: notifError,
        unreadCount,
        markAsRead,
        fetchNotifications // Función para refrescar notificaciones
    } = useUserNotifications(token);

    const { data: popularEvents, loading: popularLoading, error: popularError } = useFetchEvents('eventos/most_liked/');
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
    }, []);    
    
    if (popularLoading || recommendedLoading) {
        return (
            <div className="fixed inset-0 bg-white z-50">
                <LoadingSpinner
                    logoSrc="/ibento_logo.png"
                    loadingText="Cargando eventos"
                />
            </div>
        );
    }

    if (popularError || recommendedError) {
        return (
            <div className="flex min-h-screen justify-center items-center text-red-600">
                <p>Error al cargar eventos: {popularError}</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4 min-h-screen justify-center w-full items-center bg-white lg:max-w-3/4">
                <div className="flex gap-4 w-full items-center h-16 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-center text-black text-nowrap">
                        Bienvenido {usuarioName}!
                    </h1>

                    <div className="flex w-full flex-row gap-4 justify-end mr-4">
                        <div className="card flex flex-row justify-content-center items-center gap-4">
                            {/* Botón de búsqueda */}
                            <Search
                                className="w-6 h-6 text-black hover:text-purple-700 cursor-pointer transition-colors"
                                onClick={() => navigate('../busqueda')}
                            />

                            {/* Icono de notificaciones con animación */}
                            <div className="relative">
                                <button
                                    onClick={handleSidebarOpen}
                                    className={`
                                        relative p-2 rounded-full transition-all duration-200
                                        ${unreadCount > 0
                                            ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {unreadCount > 0 ? (
                                        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                                    ) : (
                                        <Bell className="w-6 h-6" />
                                    )}

                                    {/* Badge de contador de notificaciones */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px] animate-bounce">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <CircularDemo listEvents= {popularEvents}/>
                <Cards listEvents={popularEvents} name="Populares" />
                <Cards listEvents={recommendedEvents} name="Recomendados para ti" />
                <SearchMenu />
                <div className="h-16"></div>
            </div>

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

export default Page;