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

// Configuración de notificaciones
const NOTIFICATION_CONFIG = {
  icon: '/icons/ibento192x192.png',
  badge: '/icons/ibentoba.png',
  vibrate: [200, 100, 200],
  renotify: true,
  silent: false,
  requireInteraction: false
};

const NOTIFICATION_ACTIONS = {
  'like': [
    { action: 'view_profile', title: '👀 Ver perfil' },
    { action: 'dismiss', title: '❌ Cerrar' }
  ],
  'match': [
    { action: 'open_chat', title: '💬 Chatear' },
    { action: 'view_profile', title: '👀 Ver perfil' }
  ],
  'message': [
    { action: 'reply', title: '↩️ Responder' },
    { action: 'open_chat', title: '👀 Ver chat' }
  ],
  'event': [
    { action: 'view_event', title: '🎪 Ver evento' },
    { action: 'dismiss', title: '❌ Cerrar' }
  ]
};

const ROUTES = {
  view_profile: '/ibento/verLike',
  open_chat: '/ibento/chat',
  view_event: '/ibento/eventos',
  reply: '/ibento/chat'
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
    ...NOTIFICATION_CONFIG,
    body: notification?.body || 'Nueva notificación',
    tag: `ibento-${data?.type || 'general'}-${Date.now()}`,
    data: {
      ...data,
      click_action: data?.click_action || 'https://ibento.com.mx/',
      timestamp: Date.now()
    },
    requireInteraction: ['match', 'message'].includes(data?.type),
    actions: NOTIFICATION_ACTIONS[data?.type] || [{ action: 'open', title: '🔍 Abrir' }]
  };

  // Mostrar notificación
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Función para determinar URL de navegación
function getNavigationUrl(action, baseUrl = 'https://ibento.com.mx') {
  const route = ROUTES[action];
  if (!route) return baseUrl;
  return `${baseUrl}${route}`;
}

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  const { notification, action } = event;
  const data = notification.data || {};
  
  // Cerrar notificación
  notification.close();
  
  // No hacer nada si se presiona dismiss
  if (action === 'dismiss') return;
  
  // Determinar URL según la acción
  let targetUrl;
  if (action) {
    targetUrl = getNavigationUrl(action);
  } else {
    // Click general en la notificación
    targetUrl = data.click_action || getNavigationUrl('default');
  }
  
  // Abrir o enfocar ventana
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar si ya hay una ventana abierta con la URL base
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
  
  // Opcional: Enviar analytics del cierre
  const data = event.notification.data || {};
  console.log('[Analytics] Notificación cerrada:', data.type);
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