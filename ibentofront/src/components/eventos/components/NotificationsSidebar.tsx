import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { Heart, MessageCircle, Users, Clock, Bell, BellOff } from 'lucide-react';

interface NotificationSidebarProps {
    visible: boolean;
    onHide: () => void;
    notifications: any[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
    markAsRead: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
    visible,
    onHide,
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead
}) => {
    const navigate = useNavigate();

    const getNotificationIcon = (tipo: string) => {
        switch (tipo) {
            case 'match':
                return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
            case 'like':
                return <Heart className="w-5 h-5 text-pink-500" />;
            case 'mensaje':
                return <MessageCircle className="w-5 h-5 text-blue-500" fill="currentColor" />;
            default:
                return <Users className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    };

    const handleNotificationClick = (notif: any) => {
        // Marcar como leída si es necesario
        if (!notif.leido) {
            markAsRead();
        }

        // Navegar según la acción
        if (notif.accion === 'abrir_chat') {
            navigate(`/ibento/chat?match=${notif.data.match_id ?? ''}`);
        } else if (notif.accion === 'ver_perfil') {
            navigate(`/ibento/perfil/${notif.data.usuario_id}`);
        } else if (notif.accion === 'view_event') {
            navigate(`/ibento/eventos`);
        }
        
        onHide(); // Cerrar sidebar después de navegar
    };

    return (
        <Sidebar 
            visible={visible} 
            onHide={onHide} 
            position="right"
            className="w-full md:w-96"
        >
            {/* Header del Sidebar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
                    {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAsRead}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                        Marcar como leídas
                    </button>
                )}
            </div>

            {/* Contenido del Sidebar */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="text-gray-500">Cargando notificaciones...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-12 text-center">
                        <BellOff className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-red-600 font-medium">Error al cargar</p>
                        <p className="text-sm text-gray-500 mt-1">{error}</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No hay notificaciones</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Cuando tengas nuevas notificaciones aparecerán aquí
                        </p>
                    </div>
                ) : (
                    notifications.map((notif: any) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`
                                p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                                ${!notif.leido 
                                    ? 'bg-purple-50 border border-purple-200 hover:bg-purple-100' 
                                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex gap-3">
                                {/* Icono de tipo de notificación */}
                                <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notif.tipo)}
                                </div>

                                {/* Foto de perfil */}
                                <div className="flex-shrink-0">
                                    {notif.usuario_relacionado?.foto ? (
                                        <img 
                                            src={notif.usuario_relacionado.foto} 
                                            alt="perfil" 
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Contenido de la notificación */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                                {notif.titulo}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {notif.mensaje}
                                            </p>
                                            
                                            {/* Información adicional para mensajes */}
                                            {notif.tipo === 'mensaje' && notif.data?.mensajes_no_leidos > 1 && (
                                                <p className="text-xs text-purple-600 mb-2">
                                                    +{notif.data.mensajes_no_leidos - 1} mensajes más
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(notif.fecha)}
                                                </span>
                                                <span className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                                                    Ver más →
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Indicador de no leído */}
                                        {!notif.leido && (
                                            <div className="w-3 h-3 bg-purple-600 rounded-full ml-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer si hay notificaciones */}
            {notifications.length > 0 && !loading && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        Mostrando las últimas {notifications.length} notificaciones
                    </p>
                </div>
            )}
        </Sidebar>
    );
};

export default NotificationSidebar;