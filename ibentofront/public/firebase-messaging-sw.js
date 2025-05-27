// public/firebase-messaging-sw.js
// Este archivo debe estar en la carpeta public de tu proyecto

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Configuración de Firebase (debe ser la misma que en config.js)
const firebaseConfig = {
  apiKey: "AIzaSyC9cLzJYYBPB1ERFyjUrnbVeB-gewCIkbM",
  authDomain: "ibento-8e4fc.firebaseapp.com",
  projectId: "ibento-8e4fc",
  storageBucket: "ibento-8e4fc.firebasestorage.app",
  messagingSenderId: "156357411233",
  appId: "1:156357411233:web:dafd393eebb9174c43cbe0",
  measurementId: "G-MZJSYRXE4E"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const { notification, data } = payload;
  
  // Configurar opciones de notificación
  const notificationTitle = notification?.title || 'Ibento';
  const notificationOptions = {
    body: notification?.body || 'Nueva notificación',
    icon: '/icons/ibento192x192.png',
    badge: '/icons/ibentoba.png',
    tag: data?.type || 'ibento-notification',
    data: {
      ...data,
      click_action: data?.click_action || 'https://ibento.com.mx/',
      timestamp: Date.now()
    },
    vibrate: [200, 100, 200],
    renotify: true,
    requireInteraction: getRequireInteraction(data?.type),
    actions: getNotificationActions(data?.type),
    silent: false
  };

  // Mostrar notificación
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Función para determinar si requiere interacción según el tipo
function getRequireInteraction(type) {
  const interactiveTypes = ['match', 'message'];
  return interactiveTypes.includes(type);
}

// Función para obtener acciones según el tipo de notificación
function getNotificationActions(type) {
  const actions = {
    'like': [
      { action: 'view', title: '👀 Ver perfil' },
      { action: 'dismiss', title: '❌ Cerrar' }
    ],
    'match': [
      { action: 'chat', title: '💬 Chatear' },
      { action: 'view', title: '👀 Ver perfil' }
    ],
    'message': [
      { action: 'reply', title: '↩️ Responder' },
      { action: 'view', title: '👀 Ver chat' }
    ],
    'event': [
      { action: 'view', title: '🎪 Ver evento' },
      { action: 'dismiss', title: '❌ Cerrar' }
    ]
  };

  return actions[type] || [
    { action: 'open', title: '🔍 Abrir' }
  ];
}

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  const { notification, action } = event;
  const data = notification.data || {};
  
  // Cerrar notificación
  notification.close();
  
  // Determinar URL según la acción
  let targetUrl = data.click_action || 'https://ibento.com.mx/';
  
  switch (action) {
    case 'view':
      if (data.type === 'like') {
        targetUrl = 'https://ibento.com.mx/ibento/verLike';
      } else if (data.type === 'event') {
        targetUrl = 'https://ibento.com.mx/ibento/eventos';
      } else if (data.type === 'message' || data.type === 'match') {
        targetUrl = 'https://ibento.com.mx/ibento/chat';
      }
      break;
      
    case 'chat':
    case 'reply':
      targetUrl = 'https://ibento.com.mx/ibento/chat';
      break;
      
    case 'dismiss':
      return; // No hacer nada, solo cerrar
      
    case 'open':
    default:
      // Usar la URL por defecto del data
      break;
  }
  
  // Abrir o enfocar ventana
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar si ya hay una ventana abierta con la URL
      for (const client of clientList) {
        if (client.url.includes('ibento.com.mx') && 'focus' in client) {
          client.focus();
          return client.navigate ? client.navigate(targetUrl) : clients.openWindow(targetUrl);
        }
      }
      
      // Si no hay ventana abierta, abrir nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

// Manejar instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Installing...');
  self.skipWaiting();
});

// Manejar activación del service worker
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Activated');
  event.waitUntil(self.clients.claim());
});