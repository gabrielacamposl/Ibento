// IMPORTANTE: Cambiar la ver cada vez que se haga updates
const CACHE_VERSION = 'v2.3.4.2'; // <- INCREMENTAR ESTO CON CADA DEPLOY
const CACHE_NAME = `ibento-${CACHE_VERSION}`;
const CACHE_EVENTOS = `ibento-eventos-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/index.html',
  '/icons/ibento.png',
  '/icons/ibentoba.png',
  '/manifest.webmanifest',
  '/offline.html',
];

const EVENT_API_URLS = [
  'https://ibento.onrender.com/api/eventos/most_liked/',
  'https://ibento.onrender.com/api/eventos/recommended_events',
  'https://ibento.onrender.com/api/eventos/upcoming_events/',
  'https://ibento.onrender.com/api/eventos/by_category?category=Música',
  'https://ibento.onrender.com/api/eventos/by_category?category=Deportes'
];

// Importar Firebase Messaging (solo una vez)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configurar Firebase
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

  messaging.onBackgroundMessage(function(payload) {
    console.log('[SW] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/icons/ibento192x192.png',
      badge: '/icons/ibentoba.png',
      vibrate: [200, 100, 200],
      data: {
        click_action: payload.data?.click_action || 'https://ibento.com.mx/',
        url: payload.data?.url || 'https://ibento.com.mx/',
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

// --------------------------- Función para limpiar caches viejos más agresiva ------------------
async function limpiarCachesViejos() {
  const cacheNames = await caches.keys();

  const cachesToDelete = cacheNames.filter(name => 
    // Elimina si no es uno de los actuales
    (name.startsWith('ibento-') && name !== CACHE_NAME && name !== CACHE_EVENTOS) ||
    // Elimina específicamente estos dos caches antiguos
    name === 'ibento-v2.3.4.1' || name === 'ibento-eventos-v2.3.4.1'
  );

  await Promise.all(
    cachesToDelete.map(name => {
      console.log(`🧹 Borrando cache: ${name}`);
      return caches.delete(name);
    })
  );
}
// Cachear eventos con timestamp para invalidar cache viejo
async function cacheEventosDinamicos() {
  const cache = await caches.open(CACHE_EVENTOS);
  
  for (const url of EVENT_API_URLS) {
    try {
      // Agregar timestamp para evitar cache del navegador
      const urlWithTimestamp = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      const response = await fetch(urlWithTimestamp);
      
      if (response.ok) {
        // Guardar con la URL original (sin timestamp)
        await cache.put(url, response.clone());
        console.log('[SW] Cacheado:', url);
      }
    } catch (err) {
      console.warn('[SW] Falló al cachear:', url, err);
    }
  }
}

// INSTALL - Cachear recursos estáticos
self.addEventListener('install', event => {
  console.log('[SW] Install - Nueva versión:', CACHE_VERSION);
  
  // Forzar activación inmediata del nuevo SW
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cachear recursos con timestamp para evitar cache del navegador
        const urlsWithTimestamp = PRECACHE_URLS.map(url => {
          const separator = url.includes('?') ? '&' : '?';
          return `${url}${separator}_v=${CACHE_VERSION}&_t=${Date.now()}`;
        });
        
        // Hacer fetch manual para tener más control
        const responses = await Promise.allSettled(
          urlsWithTimestamp.map(urlWithTimestamp => fetch(urlWithTimestamp))
        );
        
        // Cachear las respuestas exitosas con la URL original
        for (let i = 0; i < PRECACHE_URLS.length; i++) {
          const result = responses[i];
          if (result.status === 'fulfilled' && result.value.ok) {
            await cache.put(PRECACHE_URLS[i], result.value);
            console.log('[SW] Cacheado:', PRECACHE_URLS[i]);
          } else {
            console.warn('[SW] Falló al cachear:', PRECACHE_URLS[i]);
          }
        }
        
        console.log('[SW] Precache completado');
      } catch (error) {
        console.error('[SW] Error en install:', error);
      }
    })()
  );
});

// ACTIVATE - Limpiar caches viejos y activar
self.addEventListener('activate', event => {
  console.log('[SW] Activating SW - Versión:', CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        // Limpiar caches viejos primero
        await limpiarCachesViejos();
        
        // Cachear eventos dinámicos
        await cacheEventosDinamicos();
        
        // Tomar control de todos los clientes inmediatamente
        await self.clients.claim();
        
        // Notificar a todos los clientes que hay una nueva versión
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
        
        console.log('[SW] Activación completada - Versión:', CACHE_VERSION);
      } catch (error) {
        console.error('[SW] Error en activate:', error);
      }
    })()
  );
});

// FETCH - Estrategia de cache mejorada
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Solo manejar requests GET
  if (request.method !== 'GET') return;
  
  // Para APIs de eventos - Network First con Stale While Revalidate
  if (EVENT_API_URLS.some(apiUrl => request.url.startsWith(apiUrl))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_EVENTOS);
        
        try {
          // Intentar network primero
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            // Actualizar cache en background
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          console.log('[SW] Network failed, usando cache:', request.url);
        }
        
        // Si falla network, usar cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no hay cache, devolver error
        return new Response('Sin conexión', { status: 503 });
      })()
    );
    return;
  }
  
  // Para recursos estáticos - Cache First
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          // Cachear recursos estáticos nuevos
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (error) {
        console.log('[SW] Network failed:', request.url);
        
        // Para documentos HTML, devolver página offline
        if (request.destination === 'document') {
          const offlinePage = await cache.match('/offline.html');
          if (offlinePage) return offlinePage;
        }
      }
      
      return new Response('Recurso no disponible', { status: 404 });
    })()
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const notificationType = notificationData.type || 'general';
  const clickAction = notificationData.click_action;
  
  let targetUrl = 'https://ibento.com.mx/';
  
  switch(notificationType) {
    case 'like':
      targetUrl = 'ibento/verLike';
      break;
    case 'match':
      targetUrl = 'ibento/match';
      break;
    case 'message':
      targetUrl = 'ibento/chat';
      break;
    default:
      targetUrl = clickAction;
  }
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      const baseUrl = self.location.origin;
      const fullUrl = new URL(targetUrl, baseUrl).href;
      
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
  
  // Responder con la versión actual
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION
    });
  }
});