// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  onMessageListener, 
  sendTokenToServer,
  setupNotifications 
} from '../firebase';

export const useNotifications = (user) => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar soporte del navegador
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      console.log('🔍 Soporte de notificaciones:', supported);
      return supported;
    };

    if (checkSupport() && user) {
      console.log('👤 Usuario detectado, inicializando notificaciones para:', user);
      initializeNotifications();
    }
  }, [user]);

  const initializeNotifications = async () => {
    try {
      console.log('🚀 Inicializando notificaciones...');
      
      // Configurar service worker si no está registrado
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service Worker registrado:', registration);
        } catch (swError) {
          console.error('❌ Error registrando Service Worker:', swError);
        }
      }

      // Solicitar permisos y obtener token
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        console.log('✅ Token FCM obtenido:', fcmToken);
        
        // Enviar token al servidor
        if (user?.id || user?._id) {
          try {
            await sendTokenToServer(fcmToken);
            console.log('✅ Token enviado al servidor');
          } catch (error) {
            console.error('❌ Error enviando token al servidor:', error);
          }
        }
        
        // Configurar listener para mensajes en primer plano
        setupForegroundListener();
      }
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
    }
  };

  const setupForegroundListener = () => {
    console.log('👂 Configurando listener para mensajes en primer plano...');
    
    onMessageListener()
      .then((payload) => {
        console.log('📨 Mensaje recibido en primer plano:', payload);
        setNotification(payload);
        
        // Mostrar notificación personalizada en la UI
        showInAppNotification(payload);
      })
      .catch((err) => console.error('❌ Error en listener de mensajes:', err));
  };

  const showInAppNotification = (payload) => {
    console.log('🎨 Mostrando notificación in-app:', payload);
    
    // Crear notificación in-app personalizada
    const notificationElement = document.createElement('div');
    notificationElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notificationElement.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">${getNotificationIcon(payload.data?.type)}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${payload.notification?.title || 'Nueva notificación'}
          </div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
            ${payload.notification?.body || ''}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
    `;

    // Agregar evento click para navegar
    notificationElement.onclick = (e) => {
      if (e.target.tagName === 'BUTTON') return; // Ignorar click en botón cerrar
      
      handleNotificationNavigation(payload.data);
      notificationElement.remove();
    };

    // Agregar estilos de animación si no existen
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notificationElement);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notificationElement.remove(), 300);
      }
    }, 5000);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'like': '💕',
      'match': '🎉',
      'message': '💬',
      'event': '🎪',
      'welcome': '🔔',
      'test': '🧪',
      'general': '📱'
    };
    return icons[type] || icons.general;
  };

  const handleNotificationNavigation = (data) => {
    console.log('🧭 Navegando por notificación:', data);
    
    if (!data) return;
    
    // Navegar según el tipo de notificación
    switch (data.type) {
      case 'like':
        window.location.href = '/ibento/verLike';
        break;
      case 'match':
        window.location.href = '/ibento/match';
        break;
      case 'message':
        window.location.href = '/ibento/chat';
        break;
      case 'event':
        window.location.href = '/ibento/eventos';
        break;
      default:
        if (data.click_action) {
          window.location.href = data.click_action;
        }
    }
  };

  const requestPermissions = async () => {
    console.log('🔔 Solicitando permisos manualmente...');
    
    try {
      const result = await setupNotifications();
      
      if (result.success) {
        setToken(result.token);
        setupForegroundListener();
        console.log('✅ Notificaciones configuradas exitosamente');
        return result.token;
      } else {
        console.error('❌ Error configurando notificaciones:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en requestPermissions:', error);
      return null;
    }
  };

  return {
    token,
    notification,
    isSupported,
    requestPermissions
  };
};