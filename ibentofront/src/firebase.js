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

// Función para solicitar permisos y obtener token (simplificada para el hook)
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Requesting notification permission...');
    
    // Verificar soporte del navegador
    if (!('Notification' in window)) {
      console.log('❌ Browser does not support notifications');
      return null;
    }

    // Verificar si ya tenemos permisos
    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return await getFirebaseToken();
    }

    // Solicitar permisos
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return await getFirebaseToken();
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return null;
  }
};

// Función para obtener el token de Firebase (simplificada para el hook)
const getFirebaseToken = async () => {
  try {
    const token = await getToken(messaging, { 
      vapidKey: VAPID_KEY 
    });
    
    if (token) {
      console.log('🎯 Firebase token generated successfully');
      return token;
    } else {
      console.log('❌ No registration token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

// Función para configurar listener de mensajes en primer plano (requerida por el hook)
export const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    onMessage(messaging, (payload) => {
      console.log('📨 Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Función para enviar token al servidor (simplificada para el hook)
export const sendTokenToServer = async (token, userId) => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}save-fcm-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token,
        user_id: userId,
        device_type: 'web'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token sent to server successfully:', data);
      return data;
    } else {
      const error = await response.json();
      console.error('❌ Failed to send token to server:', error);
      throw new Error(error.error || 'Server error');
    }
  } catch (error) {
    console.error('❌ Error sending token to server:', error);
    throw error;
  }
};

// Variables para PWA Install Prompt
let deferredPrompt;
let installPromptShown = false;

// Función para verificar prompt de instalación PWA (requerida por el hook)
export const checkInstallPrompt = () => {
  // Escuchar el evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🔽 PWA Install prompt intercepted');
    
    // Prevenir que se muestre automáticamente
    e.preventDefault();
    
    // Guardar el evento para uso posterior
    deferredPrompt = e;
    
    // Mostrar botón de instalación personalizado (opcional)
    showInstallButton();
  });

  // Escuchar cuando la app es instalada
  window.addEventListener('appinstalled', (e) => {
    console.log('🎉 PWA was installed successfully');
    hideInstallButton();
    
    // Opcional: enviar evento a analytics
    if (window.gtag) {
      window.gtag('event', 'pwa_install', {
        'event_category': 'PWA',
        'event_label': 'App Installed'
      });
    }
  });

  // Verificar si ya está instalado
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 PWA is already installed');
    return true;
  }
  
  return false;
};

// Función para configurar notificaciones
export const setupNotifications = async () => {
  try {
    console.log('🚀 Setting up notifications...');
    
    // Solicitar permisos y obtener token
    const token = await requestNotificationPermission();
    
    if (!token) {
      console.log('❌ Failed to get token');
      return { success: false, error: 'Failed to get token' };
    }

    // Enviar token al servidor
    try {
      await sendTokenToServer(token);
    } catch (error) {
      console.log('❌ Failed to register token on server:', error.message);
      return { success: false, error: error.message };
    }

    // Configurar listener para mensajes en primer plano
    setupForegroundMessageListener();
    
    console.log('🎉 Notifications setup completed successfully!');
    return { success: true, token };
    
  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    return { success: false, error: error.message };
  }
};

// Función para manejar mensajes cuando la app está en primer plano
const setupForegroundMessageListener = () => {
  onMessage(messaging, (payload) => {
    console.log('📨 Message received in foreground:', payload);
    
    // Mostrar notificación personalizada
    if (payload.notification) {
      showCustomNotification(payload);
    }
    
    // Manejar acciones específicas según el tipo
    handleNotificationAction(payload);
  });
};

// Función para mostrar notificación personalizada
const showCustomNotification = (payload) => {
  const { notification, data } = payload;
  
  // Solo mostrar si la página no está visible
  if (document.hidden) {
    const notificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icons/ibento192x192.png',
      badge: '/icons/ibentoba.png',
      tag: data?.type || 'ibento-notification',
      data: data,
      vibrate: [200, 100, 200],
      renotify: true,
      requireInteraction: true
    };

    const customNotification = new Notification(notification.title, notificationOptions);
    
    customNotification.onclick = () => {
      console.log('🖱️ Notification clicked');
      handleNotificationClick(data);
      customNotification.close();
    };
  } else {
    // Si la app está visible, mostrar notificación in-app
    showInAppNotification(payload);
  }
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
      window.location.href = '/ibento/match';
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

// Función para desactivar notificaciones
export const disableNotifications = async () => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      throw new Error('No auth token found');
    }

    // Obtener token actual
    const token = await getFirebaseToken();
    if (!token) {
      return { success: false, error: 'Could not get current token' };
    }

    // Enviar solicitud al servidor para desactivar
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}remove-fcm-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token: token
      })
    });

    if (response.ok) {
      console.log('✅ Notifications disabled successfully');
      return { success: true };
    } else {
      const error = await response.json();
      console.error('❌ Failed to disable notifications:', error);
      return { success: false, error: error.error || 'Server error' };
    }
  } catch (error) {
    console.error('❌ Error disabling notifications:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar estado de notificaciones
export const getNotificationStatus = async () => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      return { success: false, error: 'No auth token found' };
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}notification-status/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, error: error.error || 'Server error' };
    }
  } catch (error) {
    console.error('❌ Error getting notification status:', error);
    return { success: false, error: error.message };
  }
};

// Función para probar notificaciones
export const testNotification = async (title = 'Prueba', body = 'Esta es una notificación de prueba') => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}test-notification/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        body,
        type: 'test'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test notification sent successfully');
      return { success: true, data };
    } else {
      const error = await response.json();
      console.error('❌ Failed to send test notification:', error);
      return { success: false, error: error.error || 'Server error' };
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return { success: false, error: error.message };
  }
};

// Función para mostrar botón de instalación
const showInstallButton = () => {
  if (installPromptShown) return;
  
  // Crear botón de instalación flotante
  const installButton = document.createElement('div');
  installButton.id = 'pwa-install-button';
  installButton.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: bounceIn 0.5s ease-out;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      <span>📱</span>
      <span>Instalar App</span>
      <button onclick="document.getElementById('pwa-install-button').remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
        margin-left: 8px;
      ">×</button>
    </div>
  `;
  
  // Agregar evento click para instalar
  installButton.onclick = (e) => {
    if (e.target.tagName === 'BUTTON') return; // Ignorar click en botón cerrar
    triggerInstallPrompt();
  };
  
  // Agregar estilos de animación
  if (!document.getElementById('pwa-install-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); opacity: 0.8; }
        70% { transform: scale(0.9); opacity: 0.9; }
        100% { transform: scale(1); opacity: 1; }
      }
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
      .in-app-notification {
        transition: all 0.3s ease-out;
      }
      .in-app-notification:hover {
        transform: translateX(-5px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.4) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(installButton);
  installPromptShown = true;
  
  // Auto-ocultar después de 10 segundos si no se usa
  setTimeout(() => {
    const button = document.getElementById('pwa-install-button');
    if (button) {
      button.style.opacity = '0.7';
      button.style.transform = 'scale(0.9)';
    }
  }, 10000);
};

// Función para ocultar botón de instalación
const hideInstallButton = () => {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      installButton.remove();
    }, 300);
  }
};

// Función para mostrar el prompt de instalación
export const triggerInstallPrompt = async () => {
  if (!deferredPrompt) {
    console.log('❌ No install prompt available');
    return { success: false, error: 'Install prompt not available' };
  }

  try {
    // Mostrar el prompt
    deferredPrompt.prompt();
    
    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`👤 User response to install prompt: ${outcome}`);
    
    // Limpiar el prompt
    deferredPrompt = null;
    hideInstallButton();
    
    // Opcional: enviar evento a analytics
    if (window.gtag) {
      window.gtag('event', 'pwa_install_prompt', {
        'event_category': 'PWA',
        'event_label': outcome
      });
    }
    
    return { 
      success: true, 
      outcome,
      installed: outcome === 'accepted'
    };
    
  } catch (error) {
    console.error('❌ Error showing install prompt:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar si la PWA puede ser instalada
export const canInstallPWA = () => {
  return !!deferredPrompt;
};

// Función para verificar si la PWA ya está instalada
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Exportar instancias de Firebase
export { app, analytics, messaging };