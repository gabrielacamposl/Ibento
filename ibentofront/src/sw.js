const CACHE_NAME = 'ibento-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icons/ibento.png',
  '/icons/ibentoba.png',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/offline.html',
];

const CACHE_EVENTOS = 'ibento-eventos';
const EVENT_API_URLS = [
  'https://ibento.onrender.com/api/eventos/most_liked/',
  'https://ibento.onrender.com/api/eventos/recommended_events',
  'https://ibento.onrender.com/api/eventos/upcoming_events/',
  'https://ibento.onrender.com/api/eventos/by_category?category=Música',
  'https://ibento.onrender.com/api/eventos/by_category?category=Deportes'
];

// Importar Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Importar Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configurar Firebase si no está ya configurado
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyC9cLzJYYBPB1ERFyjUrnbVeB-gewCIkbM",
    authDomain: "ibento-8e4fc.firebaseapp.com",
    projectId: "ibento-8e4fc",
    storageBucket: "ibento-8e4fc.firebasestorage.app",
    messagingSenderId: "156357411233",
    appId: "1:156357411233:web:dafd393eebb9174c43cbe0",
    measurementId: "G-MZJSYRXE4E"
  });

  const messaging = firebase.messaging();

  // Manejar mensajes en segundo plano
  messaging.onBackgroundMessage(function(payload) {
    console.log('[SW] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/icons/ibento192x192.png',
      badge: '/icons/ibentoba.png',
      vibrate: [200, 100, 200],
      data: {
        click_action: payload.data?.click_action || '/',
        url: payload.data?.url || '/',
        type: payload.data?.type || 'general',
        timestamp: payload.data?.timestamp || Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Ver ahora',
          icon: '/icons/ibento48x48.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ],
      tag: payload.data?.type || 'ibento-notification',
      renotify: true,
      requireInteraction: true,
      silent: false
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Cachear eventos destacados desde APIs
async function cacheEventosDinamicos() {
  const cache = await caches.open(CACHE_EVENTOS);
  for (const url of EVENT_API_URLS) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
        console.log('[SW] Cacheado:', url);
      }
    } catch (err) {
      console.warn('[SW] Falló al cachear:', url, err);
    }
  }
}

self.addEventListener('install', event => {
  console.log('[SW] Install');
  self.skipWaiting(); // Activar inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating SW ...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== CACHE_EVENTOS)
          .map(name => caches.delete(name))
      );
      await cacheEventosDinamicos();
      await self.clients.claim();
    })()
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();
  
  // Obtener datos de la notificación
  const notificationData = event.notification.data || {};
  const notificationType = notificationData.type || 'general';
  const clickAction = notificationData.click_action;
  
  let targetUrl = '/';
  
  // Determinar URL según el tipo de notificación
  switch(notificationType) {
    case 'like':
      targetUrl = '/ibento/verLike';
      break;
    case 'match':
      targetUrl = '/ibento/match';
      break;
    case 'message':
      targetUrl = '/ibento/chat';
      break;
    default:
      targetUrl = clickAction || '/';
  }
  
  // Manejar acciones de botones
  if (event.action === 'close') {
    return; // No hacer nada, solo cerrar
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      const baseUrl = self.location.origin;
      const fullUrl = new URL(targetUrl, baseUrl).href;
      
      // Buscar si ya hay una ventana abierta con la app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.startsWith(baseUrl) && 'focus' in client) {
          return client.focus().then(() => {
            // Enviar mensaje al cliente para navegar
            return client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl
            });
          });
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Manejar fetch con cache
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Cache para APIs de eventos
  if (EVENT_API_URLS.some(apiUrl => request.url.startsWith(apiUrl))) {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request).then(res => {
            const resClone = res.clone();
            caches.open(CACHE_EVENTOS).then(cache => cache.put(request, resClone));
            return res;
          }).catch(() => cached) // Devolver cache si falla la red
        );
      })
    );
    return;
  }

  // Cache general
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).catch(() => {
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
      );
    })
  );
});