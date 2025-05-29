import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../../../hooks/useNotificationSidebar';
import { Heart, MessageCircle, Users, Clock, X, Eye } from 'lucide-react';
import { Button } from "primereact/button";

interface NotificationsSidebarProps {
  visible: boolean;
  onHide: () => void;
}

const NotificationsSidebar: React.FC<NotificationsSidebarProps> = ({ visible, onHide }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    handleNotificationAction 
  } = useNotifications();

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'match':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'like':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'mensaje':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
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

  const handleNotificationClick = (notification: Notification) => {
    handleNotificationAction(notification, navigate);
    onHide(); // Cerrar sidebar después de la acción
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onHide}>
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-gray-100"
                title="Marcar todas como leídas"
              >
                <Eye className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={onHide}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-ring loading-lg text-purple-600"></span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <p>Error al cargar notificaciones</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No tienes notificaciones</p>
              <p className="text-sm mt-1">Cuando tengas nuevas notificaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.leido ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono de notificación */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.tipo)}
                    </div>

                    {/* Foto de perfil del usuario relacionado */}
                    <div className="flex-shrink-0">
                      {notification.usuario_relacionado.foto ? (
                        <img
                          src={notification.usuario_relacionado.foto}
                          alt={notification.usuario_relacionado.nombre}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Contenido de la notificación */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {notification.titulo}
                        </h3>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(notification.fecha)}
                          </span>
                          {!notification.leido && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.mensaje}
                      </p>
                      
                      {/* Información adicional según el tipo */}
                      {notification.tipo === 'mensaje' && notification.data.mensajes_no_leidos && notification.data.mensajes_no_leidos > 1 && (
                        <p className="text-xs text-blue-600 mt-1">
                          +{notification.data.mensajes_no_leidos - 1} mensajes más
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSidebar;