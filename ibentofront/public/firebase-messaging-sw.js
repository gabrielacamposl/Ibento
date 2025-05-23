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
  console.log('[Service Worker] Received background message:', payload);

  const { notification, data } = payload;
  
  // Configurar opciones de notificación
  const notificationTitle = notification?.title || 'Ibento';
  const notificationOptions = {
    body: notification?.body || 'Nueva notificación',
    icon: notification?.icon || '/icons/ibento192x192.png',
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
      { action: 'view', title: '👀 Ver perfil', icon: '/icons/view.png' },
      { action: 'dismiss', title: '❌ Cerrar', icon: '/icons/close.png' }
    ],
    'match': [
      { action: 'chat', title: '💬 Chatear', icon: '/icons/chat.png' },
      { action: 'view', title: '👀 Ver perfil', icon: '/icons/view.png' }
    ],
    'message': [
      { action: 'reply', title: '↩️ Responder', icon: '/icons/reply.png' },
      { action: 'view', title: '👀 Ver chat', icon: '/icons/chat.png' }
    ],
    'event': [
      { action: 'view', title: '🎪 Ver evento', icon: '/icons/event.png' },
      { action: 'dismiss', title: '❌ Cerrar', icon: '/icons/close.png' }
    ]
  };

  return actions[type] || [
    { action: 'open', title: '🔍 Abrir', icon: '/icons/open.png' }
  ];
}

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  const { notification, action } = event;
  const data = notification.data || {};
  
  // Cerrar notificación
  notification.close();
  
  // Determinar URL según la acción
  let targetUrl = data.click_action || 'https://ibento.com.mx/';
  
  switch (action) {
    case 'view':
      if (data.type === 'like') {
        targetUrl = 'https://ibento.com.mx/ibento/match';
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
          client.navigate(targetUrl);
          return;
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
  console.log('[Service Worker] Notification closed:', event);
  
  const data = event.notification.data || {};
  
  // Enviar evento analítico (opcional)
  if (data.type) {
    console.log(`[Analytics] Notification dismissed: ${data.type}`);
  }
});

// Manejar instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  // Forzar activación inmediata
  self.skipWaiting();
});

// Manejar activación del service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  
  // Tomar control de todos los clientes inmediatamente
  event.waitUntil(self.clients.claim());
});

// Manejar errores de push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received:', event);
  
  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log('[Service Worker] Push payload:', payload);
    
    // Firebase ya maneja esto automáticamente con onBackgroundMessage
    // pero podemos agregar lógica adicional aquí si es necesario
    
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
  }
});

// Manejar errores
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event.error);
});

// Función utilitaria para logging
function logWithTimestamp(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}