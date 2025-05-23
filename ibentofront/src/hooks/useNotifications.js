// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  onMessageListener, 
  sendTokenToServer,
  checkInstallPrompt 
} from '../firebase';

export const useNotifications = (user) => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar soporte del navegador
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      return supported;
    };

    if (checkSupport() && user) {
      initializeNotifications();
    }

    // Verificar prompt de instalación
    checkInstallPrompt();
  }, [user]);

  const initializeNotifications = async () => {
    try {
      // Solicitar permisos y obtener token
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        
        // Enviar token al servidor
        if (user?.id) {
          await sendTokenToServer(fcmToken, user.id);
        }
        
        // Configurar listener para mensajes en primer plano
        const unsubscribe = onMessageListener()
          .then((payload) => {
            console.log('Received foreground message:', payload);
            setNotification(payload);
            
            // Mostrar notificación personalizada en la UI
            showInAppNotification(payload);
          })
          .catch((err) => console.log('Failed to receive message:', err));

        return unsubscribe;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const showInAppNotification = (payload) => {
    // Crear notificación in-app personalizada
    const notificationElement = document.createElement('div');
    notificationElement.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="display: flex; align-items: start; gap: 12px;">
          <img src="${payload.notification?.icon || '/icons/ibento48x48.png'}" 
               style="width: 40px; height: 40px; border-radius: 50%;" />
          <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 4px; color: #111827;">
              ${payload.notification?.title || 'Nueva notificación'}
            </div>
            <div style="color: #6b7280; font-size: 14px; line-height: 1.4;">
              ${payload.notification?.body || ''}
            </div>
          </div>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 18px;">
            ×
          </button>
        </div>
      </div>
    `;

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
        notificationElement.remove();
      }
    }, 5000);
  };

  const requestPermissions = async () => {
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      if (user?.id) {
        await sendTokenToServer(fcmToken, user.id);
      }
    }
    return fcmToken;
  };

  return {
    token,
    notification,
    isSupported,
    requestPermissions
  };
};