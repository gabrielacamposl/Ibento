import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellDot, Search } from 'lucide-react';

import Carousel from './components/carousel';
import Cards from './components/cards';
import SearchMenu from './components/menu';
import CircularDemo from './components/carousel2';

import { Sidebar } from 'primereact/sidebar';

import { useFetchEvents, useFetchRecommendedEvents } from '../../hooks/usefetchEvents';
import { useUserNotifications } from '../../hooks/useNotificationSidebar';


function Page() {
    const navigate = useNavigate();

    const [usuarioName, setUsuarioName] = useState('');
    const [visible, setVisible] = useState(false);
    const token = localStorage.getItem("access") ?? "";
    const { notifications, loading: notifLoading, error: notifError, unreadCount, markAsRead } = useUserNotifications(token);


    const { data: popularEvents, loading: popularLoading, error: popularError } = useFetchEvents('eventos/most_liked/');
    const { data: recommendedEvents, loading: recommendedLoading, error: recommendedError } = useFetchRecommendedEvents('eventos/recommended_events', localStorage.getItem("access") ?? "");

    const handleSidebarOpen = () => {
        setVisible(true);
        markAsRead();
    };


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
                <div className="flex gap-4 w-full items-center h-16 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-center text-black text-nowrap">
                        Bienvenido {usuarioName}!
                    </h1>

                    <div className="flex w-full flex-row gap-4 justify-end mr-4">
                        <div className="card flex justify-content-center items-center gap-4">
                            {/* Sidebar */}
                            <Sidebar visible={visible} onHide={() => setVisible(false)} fullScreen>
                                <h2 className="text-2xl font-bold mb-4">Notificaciones</h2>

                                {notifLoading ? (
                                    <p>Cargando notificaciones...</p>
                                ) : notifError ? (
                                    <p className="text-red-600">{notifError}</p>
                                ) : notifications.length === 0 ? (
                                    <p>No tienes notificaciones recientes.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {notifications.map((notif: any) => (
                                            <li key={notif.id} className="border-b pb-2">
                                                <div className="flex gap-2 items-center">
                                                    {notif.usuario_relacionado?.foto && (
                                                        <img src={notif.usuario_relacionado.foto} alt="perfil" className="w-10 h-10 rounded-full" />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold">{notif.titulo}</p>
                                                        <p className="text-sm text-gray-600">{notif.mensaje}</p>
                                                        <button
                                                            onClick={() => {
                                                                if (notif.accion === 'abrir_chat') {
                                                                    navigate(`/ibento/chat?match=${notif.data.match_id ?? ''}`);
                                                                } else if (notif.accion === 'ver_perfil') {
                                                                    navigate(`/ibento/perfil/${notif.data.usuario_id}`);
                                                                } else if (notif.accion === 'view_event') {
                                                                    navigate(`/ibento/eventos`);
                                                                }
                                                            }}
                                                            className="text-purple-700 text-sm hover:underline"
                                                        >
                                                            Ver más
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Sidebar>


                            {/* Botón de búsqueda */}
                            <Search
                                className="w-6 h-6 text-black hover:text-purple-700 cursor-pointer"
                                onClick={() => navigate('../busqueda')}
                            />

                            {/* Icono de notificaciones */}
                            <div className="relative">
                                {unreadCount > 0 ? (
                                    <>
                                        <BellDot
                                            className="w-6 h-6 text-black hover:text-purple-700 cursor-pointer"
                                            onClick={() => setVisible(true)}
                                        />
                                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] h-[18px]">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    </>
                                ) : (
                                   <BellDot 
                                   className={`w-6 h-6 text-black cursor-pointer hover:text-purple-700 transition-transform duration-300 ${unreadCount > 0 ? 'animate-ping-fast' : ''}`}
                                   onClick={handleSidebarOpen} 
                                   />

                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <CircularDemo />
                <Cards listEvents={popularEvents} name="Populares" />
                <Cards listEvents={recommendedEvents} name="Recomendados para ti" />
                <SearchMenu />
                <div className="h-16"></div>
            </div>
        </>
    );
}

export default Page;