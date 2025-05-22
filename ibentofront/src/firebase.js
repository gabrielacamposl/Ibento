// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// VAPID Key Pública
const VAPID_KEY = import.meta.env.VAPID_PUBLICA;


// Función para solicitar permisos y obtener token
export const requestNotificationPermission = async () => {
  try {
    console.log('Requesting notification permission...');
    
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Verificar si ya tenemos permisos
    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return await getFirebaseToken();
    }

    // Solicitar permisos
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return await getFirebaseToken();
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
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
      console.log('Firebase token generated:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Función para manejar mensajes cuando la app está en primer plano
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Mostrar notificación personalizada cuando la app está activa
      if (payload.notification) {
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
          body: payload.notification.body,
          icon: payload.notification.icon || '/icons/ibento192x192.png',
          badge: '/icons/ibentoba.png',
          tag: payload.data?.type || 'ibento-notification',
          data: payload.data
        };

        // Solo mostrar si el documento no está visible
        if (document.hidden) {
          new Notification(notificationTitle, notificationOptions);
        }
      }
      
      resolve(payload);
    });
  });

// Función para enviar token al servidor
export const sendTokenToServer = async (token, userId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/save-fcm-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Tu método de auth
      },
      body: JSON.stringify({
        token: token,
        user_id: userId
      })
    });

    if (response.ok) {
      console.log('Token sent to server successfully');
      return true;
    } else {
      console.error('Failed to send token to server');
      return false;
    }
  } catch (error) {
    console.error('Error sending token to server:', error);
    return false;
  }
};

// Función para verificar si la app puede ser instalada
export const checkInstallPrompt = () => {
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar tu botón/banner personalizado de instalación
    showInstallBanner(deferredPrompt);
  });

  return deferredPrompt;
};

// Función para mostrar banner de instalación personalizado
const showInstallBanner = (deferredPrompt) => {
  // Solo mostrar si no se ha instalado ya
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return; // Ya está instalada
  }

  // Crear banner de instalación
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 4px;">¡Instala Ibento!</div>
        <div style="font-size: 14px; opacity: 0.9;">Accede más rápido y recibe notificaciones</div>
      </div>
      <div>
        <button id="install-later" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          margin-right: 8px;
          cursor: pointer;
        ">Más tarde</button>
        <button id="install-now" style="
          background: white;
          border: none;
          color: #6366f1;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        ">Instalar</button>
      </div>
    </div>
  `;

  // Agregar estilos para la animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(installBanner);

  // Manejar clics
  document.getElementById('install-now').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
    }
    installBanner.remove();
  });

  document.getElementById('install-later').addEventListener('click', () => {
    installBanner.remove();
    // Guardar que el usuario eligió "más tarde" para no mostrar de nuevo por un tiempo
    localStorage.setItem('install-banner-dismissed', Date.now().toString());
  });

  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (document.getElementById('install-banner')) {
      installBanner.remove();
    }
  }, 10000);
};

export { app, analytics, messaging, getToken, onMessage };