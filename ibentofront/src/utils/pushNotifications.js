// utils/pushNotifications.js - Sistema mejorado de notificaciones push
import { messaging } from '../firebase.js';
import { getToken, onMessage } from "firebase/messaging";

// Clave VAPID para web push
const VAPID_KEY = import.meta.env.VAPID_PUBLICA;

class PushNotificationService {
  constructor() {
    this.messaging = messaging;
    this.token = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.isInitialized = false;
  }

  /**
   * Inicializar el servicio de notificaciones
   */
  async initialize() {
    if (!this.isSupported) {
      console.warn('Notificaciones push no soportadas en este navegador');
      return false;
    }

    try {
      // Registrar service worker si no está registrado
      await this.registerServiceWorker();
      
      // Configurar listener de mensajes en primer plano
      this.setupForegroundMessageListener();
      
      this.isInitialized = true;
      console.log('✅ Servicio de notificaciones push inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando notificaciones push:', error);
      return false;
    }
  }

  /**
   * Registrar service worker para notificaciones
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Registrar firebase-messaging-sw.js
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registrado:', registration);
        return registration;
      } catch (error) {
        console.error('Error registrando service worker:', error);
        throw error;
      }
    }
  }

  /**
   * Solicitar permisos y obtener token FCM
   */
  async requestPermissionAndGetToken() {
    try {
      console.log('🔔 Solicitando permisos de notificación...');

      // Verificar soporte
      if (!this.isSupported) {
        throw new Error('Notificaciones no soportadas');
      }

      // Solicitar permisos
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Permisos de notificación denegados');
      }

      // Obtener token FCM
      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY
      });

      if (!token) {
        throw new Error('No se pudo obtener el token FCM');
      }

      this.token = token;
      console.log('✅ Token FCM obtenido:', token);

      // Enviar token al servidor
      await this.sendTokenToServer(token);
      
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      throw error;
    }
  }

  /**
   * Enviar token al servidor backend
   */
  async sendTokenToServer(token) {
    try {
      const authToken = localStorage.getItem('access');
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/save-fcm-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token: token,
          device_type: 'web',
          browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 
                  navigator.userAgent.includes('Firefox') ? 'firefox' : 'other'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error del servidor');
      }

      const data = await response.json();
      console.log('✅ Token enviado al servidor:', data);
      return data;
    } catch (error) {
      console.error('❌ Error enviando token al servidor:', error);
      throw error;
    }
  }

  /**
   * Configurar listener de mensajes en primer plano
   */
  setupForegroundMessageListener() {
    onMessage(this.messaging, (payload) => {
      console.log('🔔 Mensaje recibido en primer plano:', payload);

      const { notification, data } = payload;

      // Mostrar notificación in-app si la página está visible
      if (document.visibilityState === 'visible') {
        this.showInAppNotification(payload);
      }

      // Disparar eventos personalizados
      this.dispatchNotificationEvent(payload);

      // Actualizar badge/contador si es necesario
      this.updateNotificationBadge(data);
    });
  }

  /**
   * Mostrar notificación dentro de la aplicación
   */
  showInAppNotification(payload) {
    const { notification, data } = payload;
    
    // Crear elemento de notificación
    const notificationElement = document.createElement('div');
    notificationElement.className = 'ibento-in-app-notification';
    notificationElement.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${this.getNotificationIcon(data?.type)}</div>
        <div class="notification-text">
          <div class="notification-title">${notification?.title || 'Nueva notificación'}</div>
          <div class="notification-body">${notification?.body || ''}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Agregar estilos dinámicos
    notificationElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
    `;

    // Agregar evento click
    notificationElement.onclick = (e) => {
      if (e.target.classList.contains('notification-close')) return;
      this.handleNotificationClick(data);
      notificationElement.remove();
    };

    // Agregar al DOM
    document.body.appendChild(notificationElement);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.remove();
      }
    }, 5000);
  }

  /**
   * Obtener icono según tipo de notificación
   */
  getNotificationIcon(type) {
    const icons = {
      'like': '💕',
      'match': '🎉',
      'message': '💬',
      'evento': '🎪',
      'welcome': '🔔',
      'test': '🧪',
      'general': '📱'
    };
    return icons[type] || icons.general;
  }

  /**
   * Disparar eventos personalizados para la aplicación
   */
  dispatchNotificationEvent(payload) {
    const { data } = payload;
    
    // Evento general
    window.dispatchEvent(new CustomEvent('notification:received', { 
      detail: payload 
    }));

    // Eventos específicos por tipo
    switch (data?.type) {
      case 'like':
        window.dispatchEvent(new CustomEvent('notification:like', { 
          detail: { liker_name: data.liker_name } 
        }));
        break;
        
      case 'match':
        window.dispatchEvent(new CustomEvent('notification:match', { 
          detail: { match_name: data.match_name } 
        }));
        break;
        
      case 'message':
        window.dispatchEvent(new CustomEvent('notification:message', { 
          detail: { 
            sender_name: data.sender_name,
            conversacion_id: data.conversacion_id 
          } 
        }));
        break;
        
      case 'evento':
        window.dispatchEvent(new CustomEvent('notification:event', { 
          detail: { 
            event_title: data.event_title,
            event_type: data.event_type 
          } 
        }));
        break;
    }
  }

  /**
   * Actualizar badge/contador de notificaciones
   */
  updateNotificationBadge(data) {
    if (data?.unread_count && 'setAppBadge' in navigator) {
      navigator.setAppBadge(parseInt(data.unread_count));
    }
  }

  /**
   * Manejar clicks en notificaciones
   */
  handleNotificationClick(data) {
    // Enfocar la ventana
    window.focus();
    
    if (!data) return;
    
    // Navegar según la acción
    const { action, type } = data;
    
    switch (action || type) {
      case 'view_likes':
      case 'like':
        window.location.href = '/ibento/verLike';
        break;
        
      case 'open_chat':
      case 'message':
        const chatUrl = data.conversacion_id 
          ? `/ibento/chat?conversacion=${data.conversacion_id}`
          : '/ibento/chat';
        window.location.href = chatUrl;
        break;
        
      case 'view_matches':
      case 'match':
        window.location.href = '/ibento/match';
        break;
        
      case 'view_events':
      case 'evento':
        window.location.href = '/ibento/eventos';
        break;
        
      case 'view_profile':
        if (data.usuario_id) {
          window.location.href = `/ibento/perfil/${data.usuario_id}`;
        }
        break;
        
      default:
        window.location.href = '/ibento/eventos';
    }
  }

  /**
   * Desactivar notificaciones
   */
  async disableNotifications() {
    try {
      const authToken = localStorage.getItem('access');
      if (!authToken) return;

      // Informar al servidor que se desactivan las notificaciones
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/disable-notifications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token: this.token
        })
      });

      this.token = null;
      console.log('✅ Notificaciones desactivadas');
    } catch (error) {
      console.error('❌ Error desactivando notificaciones:', error);
    }
  }

  /**
   * Verificar estado de permisos
   */
  getPermissionStatus() {
    if (!this.isSupported) {
      return 'not-supported';
    }
    return Notification.permission;
  }

  /**
   * Enviar notificación de prueba
   */
  async sendTestNotification() {
    try {
      const authToken = localStorage.getItem('access');
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test-notification/`, {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error del servidor');
      }

      const data = await response.json();
      console.log('✅ Notificación de prueba enviada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
      throw error;
    }
  }
}

// Instancia singleton
const pushNotificationService = new PushNotificationService();

// Agregar estilos CSS para notificaciones in-app
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .ibento-in-app-notification .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ibento-in-app-notification .notification-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .ibento-in-app-notification .notification-text {
    flex: 1;
  }

  .ibento-in-app-notification .notification-title {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .ibento-in-app-notification .notification-body {
    font-size: 14px;
    opacity: 0.9;
  }

  .ibento-in-app-notification .notification-close {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    flex-shrink: 0;
  }

  .ibento-in-app-notification .notification-close:hover {
    background: rgba(255,255,255,0.3);
  }
`;
document.head.appendChild(style);

export default pushNotificationService;

// Exportar funciones específicas para compatibilidad
export const {
  initialize: initializePushNotifications,
  requestPermissionAndGetToken,
  sendTestNotification,
  disableNotifications,
  getPermissionStatus
} = pushNotificationService;
