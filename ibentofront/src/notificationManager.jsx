import React, { useState, useEffect } from 'react';

const NotificationManager = () => {
  const [notificationState, setNotificationState] = useState({
    isEnabled: false,
    isLoading: false,
    status: null,
    error: null
  });

  const [testState, setTestState] = useState({
    isLoading: false,
    message: ''
  });

  useEffect(() => {
    loadNotificationStatus();
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
    };

    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const loadNotificationStatus = async () => {
    setNotificationState(prev => ({ ...prev, isLoading: true }));
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) throw new Error('No auth token found');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/notification-status/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationState(prev => ({
          ...prev,
          isEnabled: data.notifications_enabled,
          status: data,
          isLoading: false,
          error: null
        }));
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Server error');
      }
    } catch (error) {
      setNotificationState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  const setupNotificationListeners = () => {
    const likeHandler = e => showToast(`💕 ${e.detail.liker_name} te dio like!`, 'success');
    const matchHandler = e => showToast(`🎉 ¡Match con ${e.detail.match_name}!`, 'success');
    const messageHandler = e => showToast(`💬 Mensaje de ${e.detail.sender_name}`, 'info');
    const eventHandler = e => showToast(`🎪 ${e.detail.event_title}`, 'info');

    window.addEventListener('notification:like', likeHandler);
    window.addEventListener('notification:match', matchHandler);
    window.addEventListener('notification:message', messageHandler);
    window.addEventListener('notification:event', eventHandler);

    return () => {
      window.removeEventListener('notification:like', likeHandler);
      window.removeEventListener('notification:match', matchHandler);
      window.removeEventListener('notification:message', messageHandler);
      window.removeEventListener('notification:event', eventHandler);
    };
  };

  const handleEnableNotifications = async () => {
    setNotificationState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      if (!('Notification' in window)) throw new Error('Browser does not support notifications');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Notification permission denied');

      setNotificationState(prev => ({
        ...prev,
        isEnabled: true,
        isLoading: false,
        error: null
      }));
      showToast('🔔 Notificaciones activadas correctamente', 'success');
      loadNotificationStatus();
    } catch (error) {
      setNotificationState(prev => ({ ...prev, isLoading: false, error: error.message }));
      showToast(`❌ Error: ${error.message}`, 'error');
    }
  };

  const handleDisableNotifications = async () => {
    setNotificationState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      setNotificationState(prev => ({
        ...prev,
        isEnabled: false,
        isLoading: false,
        error: null
      }));
      showToast('🔕 Notificaciones desactivadas', 'info');
      loadNotificationStatus();
    } catch (error) {
      setNotificationState(prev => ({ ...prev, isLoading: false, error: error.message }));
      showToast(`❌ Error: ${error.message}`, 'error');
    }
  };

  const handleTestNotification = async () => {
    setTestState({ isLoading: true, message: '' });
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) throw new Error('No auth token found');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/test-notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Notificación de prueba 🧪',
          body: 'Esta es una notificación de prueba desde Ibento',
          type: 'test'
        })
      });

      if (response.ok) {
        setTestState({ isLoading: false, message: '✅ Notificación de prueba enviada correctamente' });
        showToast('🧪 Notificación de prueba enviada', 'success');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Server error');
      }
    } catch (error) {
      setTestState({ isLoading: false, message: `❌ Error: ${error.message}` });
      showToast(`❌ Error: ${error.message}`, 'error');
    }
  };

  return (
  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🔔 Gestión de Notificaciones
      </h2>
      <p className="text-gray-600">
        Configura y prueba las notificaciones push de Ibento
      </p>
    </div>

    {/* Estado de las notificaciones */}
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-700">Estado actual:</span>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            notificationState.isEnabled ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`font-medium ${
            notificationState.isEnabled ? 'text-green-600' : 'text-red-600'
          }`}>
            {notificationState.isEnabled ? 'Activadas' : 'Desactivadas'}
          </span>
        </div>
      </div>
      
      {notificationState.status && (
        <div className="text-sm text-gray-600">
          <p>Dispositivos activos: {notificationState.status.active_devices || 0}</p>
          <p>ID de usuario: {notificationState.status.user_id}</p>
        </div>
      )}
      
      {notificationState.error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          Error: {notificationState.error}
        </div>
      )}
    </div>

    {/* Controles principales */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <button
        onClick={handleEnableNotifications}
        disabled={notificationState.isLoading || notificationState.isEnabled}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          notificationState.isEnabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {notificationState.isLoading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Activando...
          </span>
        ) : (
          '🔔 Activar Notificaciones'
        )}
      </button>

      <button
        onClick={handleDisableNotifications}
        disabled={notificationState.isLoading || !notificationState.isEnabled}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          !notificationState.isEnabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {notificationState.isLoading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Desactivando...
          </span>
        ) : (
          '🔕 Desactivar Notificaciones'
        )}
      </button>
    </div>

    {/* Sección de pruebas */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        🧪 Prueba de Notificaciones
      </h3>
      
      <button
        onClick={handleTestNotification}
        disabled={testState.isLoading || !notificationState.isEnabled}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          !notificationState.isEnabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {testState.isLoading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Enviando prueba...
          </span>
        ) : (
          '🚀 Enviar Notificación de Prueba'
        )}
      </button>
      
      {testState.message && (
        <div className={`mt-3 p-3 rounded text-sm ${
          testState.message.includes('✅')
            ? 'bg-green-100 border border-green-300 text-green-700'
            : 'bg-red-100 border border-red-300 text-red-700'
        }`}>
          {testState.message}
        </div>
      )}
    </div>

    {/* Información adicional */}
    <div className="mt-6 bg-blue-50 rounded-lg p-4">
      <h4 className="font-semibold text-blue-800 mb-2">💡 Información</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Las notificaciones te alertarán sobre likes, matches y mensajes</li>
        <li>• Funciona incluso cuando la app está cerrada</li>
        <li>• Puedes desactivarlas en cualquier momento</li>
        <li>• Se requiere permiso del navegador para funcionar</li>
      </ul>
    </div>

    <style jsx>{`
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `}</style>
  </div>
);

};

export default NotificationManager;
