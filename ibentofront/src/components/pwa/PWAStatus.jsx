// components/pwa/PWAStatus.jsx - Componente para mostrar el estado de PWA
import React, { useState, useEffect } from 'react';
import usePWAInstall from '../../hooks/usePWAInstall';

const PWAStatus = () => {
  const { isInstalled, canInstall } = usePWAInstall();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Verificar permisos de notificación
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Escuchar cambios de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs z-40 max-w-xs">
      <div className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Estado PWA</div>
      
      {/* Estado de instalación */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-500' : canInstall ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        <span className="text-gray-600 dark:text-gray-300">
          {isInstalled ? 'Instalada' : canInstall ? 'Instalable' : 'No instalable'}
        </span>
      </div>

      {/* Estado de conexión */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-gray-600 dark:text-gray-300">
          {isOnline ? 'En línea' : 'Sin conexión'}
        </span>
      </div>

      {/* Estado de notificaciones */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          notificationPermission === 'granted' ? 'bg-green-500' : 
          notificationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
        <span className="text-gray-600 dark:text-gray-300">
          Notificaciones: {
            notificationPermission === 'granted' ? 'Activadas' :
            notificationPermission === 'denied' ? 'Bloqueadas' : 'Pendientes'
          }
        </span>
      </div>

      {/* Botón para solicitar permisos */}
      {notificationPermission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="w-full bg-indigo-600 text-white text-xs py-1 px-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Activar notificaciones
        </button>
      )}
    </div>
  );
};

export default PWAStatus;
