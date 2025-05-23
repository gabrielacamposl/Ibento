import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellDot, Bell, Search } from 'lucide-react';

// Tus componentes existentes
import Carousel from './components/carousel';
import Cards from './components/cards';
import SearchMenu from './components/menu';
import CircularDemo from './components/carousel2';

// Nuevos componentes
import NotificationsSidebar from './components/NotificationsSidebar';

// Hooks
import { useFetchEvents, useFetchRecommendedEvents } from '../../hooks/usefetchEvents';
import { useNotifications } from '../../hooks/useNotifications';

function Page() {
    const navigate = useNavigate();

    // Estados existentes
    const [usuarioName, setUsuarioName] = useState('');
    const [visible, setVisible] = useState(false);

    // Hooks existentes
    const { data: popularEvents, loading: popularLoading, error: popularError } = useFetchEvents('eventos/most_liked/');
    const { data: recommendedEvents, loading: recommendedLoading, error: recommendedError } = useFetchRecommendedEvents('eventos/recommended_events', localStorage.getItem("access") ?? "");

    // Nuevo hook para notificaciones
    const { unreadCount } = useNotifications();

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

    // Función para manejar click en el icono de notificaciones
    const handleNotificationClick = () => {
        setVisible(true);
    };

    if (popularLoading || recommendedLoading) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <span className="text-black loading loading-ring loading-xl"></span>
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
                <div className="flex gap-4 w-full items-center h-16 border border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-center text-black text-nowrap">
                        Bienvenido {usuarioName}!
                    </h1>
                    <div className='flex w-full flex-row gap-4 justify-end mr-4'>
                        <Search 
                            className="w-6 h-6 text-black align-left hover:text-purple-700 cursor-pointer" 
                            onClick={() => navigate('../busqueda')} 
                        />
                        
                        {/* Icono de notificaciones con indicador */}
                        <div className="relative">
                            {unreadCount > 0 ? (
                                <div className="relative">
                                    <BellDot 
                                        className="w-6 h-6 text-black hover:text-purple-700 cursor-pointer" 
                                        onClick={handleNotificationClick}
                                    />
                                    {/* Contador de notificaciones */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] h-[18px]">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <Bell 
                                    className="w-6 h-6 text-black hover:text-purple-700 cursor-pointer" 
                                    onClick={handleNotificationClick}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <CircularDemo />
                <Cards listEvents={popularEvents} name={"Populares"} />
                <Cards listEvents={recommendedEvents} name={"Recomendados para ti"} />
                <SearchMenu />
                <div className='h-16'></div>
            </div>

            {/* Sidebar de notificaciones */}
            <NotificationsSidebar 
                visible={visible} 
                onHide={() => setVisible(false)} 
            />
        </>
    );
}

export default Page;