// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC9cLzJYYBPB1ERFyjUrnbVeB-gewCIkbM",
  authDomain: "ibento-8e4fc.firebaseapp.com",
  projectId: "ibento-8e4fc",
  storageBucket: "ibento-8e4fc.firebasestorage.app",
  messagingSenderId: "156357411233",
  appId: "1:156357411233:web:dafd393eebb9174c43cbe0",
  measurementId: "G-MZJSYRXE4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);



const VAPID_KEY = import.meta.env.VAPID_PUBLICA;

// Función para solicitar permisos y obtener token
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Solicitando permisos de notificación...');
    
    // Verificar soporte del navegador
    if (!('Notification' in window)) {
      console.log('❌ El navegador no soporta notificaciones');
      return null;
    }

    // Verificar si ya tenemos permisos
    if (Notification.permission === 'granted') {
      console.log('✅ Permisos ya otorgados');
      return await getFirebaseToken();
    }

    // Solicitar permisos
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Permisos otorgados');
      return await getFirebaseToken();
    } else {
      console.log('❌ Permisos denegados');
      return null;
    }
  } catch (error) {
    console.error('❌ Error solicitando permisos:', error);
    return null;
  }
};

// Función para obtener el token de Firebase
const getFirebaseToken = async () => {
  try {
    const token = await getToken(messaging, { 
      vapidKey: VAPID_KEY 
    });
    
    if (token) {
      console.log('🎯 Token FCM generado:', token);
      return token;
    } else {
      console.log('❌ No se pudo generar el token');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return null;
  }
};

// Función para configurar listener de mensajes en primer plano
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📨 Mensaje recibido en primer plano:', payload);
      resolve(payload);
    });
  });
};

// Función para enviar token al servidor
export const sendTokenToServer = async (token) => {
  try {
    const authToken = localStorage.getItem('access');
    if (!authToken) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/save-fcm-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token,
        device_type: 'web'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token enviado al servidor:', data);
      return data;
    } else {
      const error = await response.json();
      console.error('❌ Error enviando token al servidor:', error);
      throw new Error(error.error || 'Error del servidor');
    }
  } catch (error) {
    console.error('❌ Error enviando token:', error);
    throw error;
  }
};

// Función para configurar notificaciones completamente
export const setupNotifications = async () => {
  try {
    console.log('🚀 Configurando notificaciones...');
    
    // Solicitar permisos y obtener token
    const token = await requestNotificationPermission();
    
    if (!token) {
      console.log('❌ No se pudo obtener token');
      return { success: false, error: 'No se pudo obtener token' };
    }

    // Enviar token al servidor
    try {
      await sendTokenToServer(token);
    } catch (error) {
      console.log('❌ Error registrando token en servidor:', error.message);
      return { success: false, error: error.message };
    }

    // Configurar listener para mensajes en primer plano
    setupForegroundMessageListener();
    
    console.log('🎉 Notificaciones configuradas exitosamente!');
    return { success: true, token };
    
  } catch (error) {
    console.error('❌ Error configurando notificaciones:', error);
    return { success: false, error: error.message };
  }
};

// Función para manejar mensajes cuando la app está en primer plano
const setupForegroundMessageListener = () => {
  onMessage(messaging, (payload) => {
    console.log('📨 Mensaje recibido en primer plano:', payload);
    
    // Mostrar notificación personalizada
    if (payload.notification) {
      showInAppNotification(payload);
    }
    
    // Disparar eventos personalizados
    handleNotificationAction(payload);
  });
};

// Función para mostrar notificación dentro de la app
const showInAppNotification = (payload) => {
  const { notification, data } = payload;
  
  // Crear elemento de notificación
  const notificationElement = document.createElement('div');
  notificationElement.className = 'in-app-notification';
  notificationElement.innerHTML = `
    <div style="
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
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">${getNotificationIcon(data?.type)}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px;">${notification.title}</div>
          <div style="font-size: 14px; opacity: 0.9;">${notification.body}</div>
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
        ">×</button>
      </div>
    </div>
  `;
  
  // Agregar evento click
  notificationElement.onclick = () => {
    handleNotificationClick(data);
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
};

// Función para obtener icono según tipo de notificación
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

// Función para manejar acciones de notificación
const handleNotificationAction = (payload) => {
  const { data } = payload;
  
  if (!data) return;
  
  // Disparar eventos personalizados según el tipo
  switch (data.type) {
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
        detail: { sender_name: data.sender_name } 
      }));
      break;
      
    case 'event':
      window.dispatchEvent(new CustomEvent('notification:event', { 
        detail: { 
          event_title: data.event_title, 
          event_type: data.event_type 
        } 
      }));
      break;
      
    default:
      window.dispatchEvent(new CustomEvent('notification:general', { 
        detail: data 
      }));
  }
};

// Función para manejar clicks en notificaciones
const handleNotificationClick = (data) => {
  // Enfocar la ventana
  window.focus();
  
  if (!data) return;
  
  // Navegar según la acción
  switch (data.action) {
    case 'view_likes':
      window.location.href = '/ibento/verLike';
      break;
      
    case 'open_chat':
      window.location.href = '/ibento/chat';
      break;
      
    case 'view_event':
      window.location.href = '/ibento/eventos';
      break;
      
    default:
      if (data.click_action) {
        window.location.href = data.click_action;
      }
  }
};

// Agregar estilos CSS para animaciones
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
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
  `;
  document.head.appendChild(style);
}

// Exportar instancias de Firebase
export { app, analytics, messaging };