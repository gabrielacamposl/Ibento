// public/sw.js - Service Worker con Workbox y Firebase
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 🔥 Importar Firebase para notificaciones
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// ================== CONFIGURACIÓN FIREBASE ==================
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

  // Manejar notificaciones en background
  messaging.onBackgroundMessage(function(payload) {
    console.log('[SW] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Nueva notificación de Ibento';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/icons/ibento192x192.png',
      badge: '/icons/ibentoba.png',
      vibrate: [200, 100, 200],
      data: {
        click_action: payload.data?.click_action || 'https://ibento.com.mx/',
        type: payload.data?.type || 'general',
        timestamp: Date.now(),
        ...payload.data
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

// ================== WORKBOX CONFIGURATION ==================

// Limpiar caches antiguos automáticamente
cleanupOutdatedCaches();

// Precargar archivos esenciales (VitePWA inyecta esto automáticamente)
precacheAndRoute(self.__WB_MANIFEST);

// ================== ESTRATEGIAS DE CACHE ==================

// API Endpoints - Network First (siempre intentar red primero)
registerRoute(
  ({ url }) => url.origin === 'https://ibento.onrender.com' && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 horas
        purgeOnQuotaError: true
      })
    ]
  })
);

// Eventos populares - Stale While Revalidate (mostrar cache mientras actualiza)
registerRoute(
  ({ url }) => url.pathname.includes('/eventos/most_liked/') || 
              url.pathname.includes('/eventos/recommended_events') ||
              url.pathname.includes('/eventos/upcoming_events/'),
  new StaleWhileRevalidate({
    cacheName: 'eventos-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 30, // 30 minutos
        purgeOnQuotaError: true
      })
    ]
  })
);

// Imágenes - Cache First (usar cache primero, red solo si no existe)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        purgeOnQuotaError: true
      })
    ]
  })
);

// Assets estáticos - Cache First
registerRoute(
  ({ request }) => ['style', 'script', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        purgeOnQuotaError: true
      })
    ]
  })
);

// ================== EVENTOS DEL SERVICE WORKER ==================

// Activación
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker activado');
  
  event.waitUntil(
    (async () => {
      // Tomar control de todos los clientes inmediatamente
      await self.clients.claim();
      
      // Notificar a todos los clientes sobre la actualización
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: 'workbox-managed'
        });
      });
    })()
  );
});

// Click en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const notificationType = notificationData.type || 'general';
  
  let targetUrl = 'https://ibento.com.mx/';
  
  // Determinar URL según tipo de notificación
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
    case 'event':
      targetUrl = '/ibento/eventos';
      break;
    default:
      targetUrl = notificationData.click_action || '/ibento/eventos';
  }
  
  if (event.action === 'close') {
    return;
  }
  
  // Buscar ventana existente o abrir una nueva
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      const baseUrl = self.location.origin;
      const fullUrl = new URL(targetUrl, baseUrl).href;
      
      // Buscar ventana existente
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.startsWith(baseUrl) && 'focus' in client) {
          return client.focus().then(() => {
            return client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl
            });
          });
        }
      }
      
      // Abrir nueva ventana si no existe una
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Responder con información del SW
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: 'workbox-managed',
      ready: true
    });
  }
});

// Manejo de errores
self.addEventListener('error', event => {
  console.error('[SW] Error:', event.error);
});

// Manejo de quota exceeded
self.addEventListener('quotaexceeded', event => {
  console.warn('[SW] Quota exceeded, cleaning up caches');
  // Workbox maneja esto automáticamente con purgeOnQuotaError
});

console.log('[SW] Service Worker loaded with Workbox + Firebase');