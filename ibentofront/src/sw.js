// public/sw.js - Service Worker con Workbox y Firebase + Dating App
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

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

  // 🔥 MANEJAR NOTIFICACIONES EN BACKGROUND CON DATING FEATURES 🔥
  messaging.onBackgroundMessage(function(payload) {
    console.log('[SW] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'Nueva notificación de Ibento';
    const notificationType = payload.data?.type || 'general';
    
    // 🔥 CONFIGURACIÓN BASE 🔥
    let notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/icons/ibento192x192.png',
      badge: '/icons/ibentoba.png',
      data: {
        click_action: payload.data?.click_action || 'https://ibento.com.mx/',
        type: notificationType,
        timestamp: Date.now(),
        userId: payload.data?.userId,
        userName: payload.data?.userName,
        userPhoto: payload.data?.userPhoto,
        ...payload.data
      },
      tag: payload.data?.type || 'ibento-notification',
      renotify: true,
      requireInteraction: true,
      silent: false
    };

    // 🔥 PERSONALIZAR SEGÚN TIPO DE NOTIFICACIÓN DATING 🔥
    switch(notificationType) {
      case 'match':
        notificationOptions = {
          ...notificationOptions,
          vibrate: [500, 200, 500, 200, 500, 200, 500],
          icon: payload.data?.userPhoto || '/icons/ibento192x192.png',
          actions: [
            {
              action: 'open_chat',
              title: '💬 Chatear ahora',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'view_profile',
              title: '👤 Ver perfil',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'close',
              title: 'Cerrar'
            }
          ],
          tag: 'match-notification',
          image: payload.data?.userPhoto, // Imagen grande del usuario
          badge: '/icons/ibentoba.png'
        };
        break;

      case 'like':
        notificationOptions = {
          ...notificationOptions,
          vibrate: [300, 100, 300, 100, 300],
          icon: payload.data?.userPhoto || '/icons/ibento192x192.png',
          actions: [
            {
              action: 'like_back',
              title: '❤️ Dar like',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'view_profile',
              title: '👤 Ver perfil',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'close',
              title: 'Cerrar'
            }
          ],
          tag: 'like-notification',
          badge: '/icons/ibentoba.png'
        };
        break;

      case 'message':
        notificationOptions = {
          ...notificationOptions,
          vibrate: [200, 100, 200],
          icon: payload.data?.userPhoto || '/icons/ibento192x192.png',
          actions: [
            {
              action: 'reply_quick',
              title: '💬 Respuesta rápida',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'open_chat',
              title: 'Abrir chat',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'close',
              title: 'Cerrar'
            }
          ],
          tag: `message-${payload.data?.userId}`,
          badge: '/icons/ibentoba.png'
        };
        break;

      case 'verification_complete':
        notificationOptions = {
          ...notificationOptions,
          vibrate: [400, 200, 400, 200, 400],
          icon: '/icons/ibento192x192.png',
          actions: [
            {
              action: 'start_matching',
              title: '🔍 Comenzar a buscar matches',
              icon: '/icons/ibento48x48.png'
            },
            {
              action: 'view_profile',
              title: '👤 Ver mi perfil',
              icon: '/icons/ibento48x48.png'
            }
          ],
          tag: 'verification-notification',
          badge: '/icons/ibentoba.png'
        };
        break;

      default:
        // Configuración original para eventos
        notificationOptions.actions = [
          {
            action: 'open',
            title: 'Ver ahora',
            icon: '/icons/ibento48x48.png'
          },
          {
            action: 'close',
            title: 'Cerrar'
          }
        ];
    }

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

// 🔥 CACHE PARA ENDPOINTS DE DATING APP 🔥
registerRoute(
  ({ url }) => url.pathname.includes('/validar-ine/') || 
              url.pathname.includes('/validar-rostro/') ||
              url.pathname.includes('/matches/') ||
              url.pathname.includes('/likes/') ||
              url.pathname.includes('/messages/') ||
              url.pathname.includes('/chat/'),
  new StaleWhileRevalidate({
    cacheName: 'dating-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 10, // 10 minutos para datos de dating
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
          version: 'workbox-managed-dating'
        });
      });
    })()
  );
});

// 🔥 CLICK EN NOTIFICACIONES MEJORADO PARA DATING APP 🔥
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const notificationType = notificationData.type || 'general';
  const action = event.action;
  
  let targetUrl = '/';
  
  // 🔥 MANEJO DE ACCIONES ESPECÍFICAS DE DATING APP 🔥
  switch(action) {
    // Acciones de Match
    case 'open_chat':
      targetUrl = `/ibento/chat?userId=${notificationData.userId}`;
      break;
    case 'view_profile':
      targetUrl = `/ibento/verPerfil?userId=${notificationData.userId}`;
      break;
    
    // Acciones de Like
    case 'like_back':
      targetUrl = `/ibento/matches?action=like&userId=${notificationData.userId}`;
      break;
    
    // Acciones de Mensaje
    case 'reply_quick':
      targetUrl = `/ibento/chat?userId=${notificationData.userId}&quickReply=true`;
      break;
    
    // Acciones de Verificación
    case 'start_matching':
      targetUrl = '/ibento/matches';
      break;
    
    case 'close':
      return; // No hacer nada, solo cerrar
    
    default:
      // Determinar URL según tipo de notificación si no hay acción específica
      switch(notificationType) {
        case 'like':
          targetUrl = '/ibento/verLike';
          break;
        case 'match':
          targetUrl = '/ibento/match';
          break;
        case 'message':
          targetUrl = `/ibento/chat?userId=${notificationData.userId}`;
          break;
        case 'verification_complete':
          targetUrl = '/ibento/profileVerify';
          break;
        case 'event':
          targetUrl = '/ibento/eventos';
          break;
        default:
          targetUrl = notificationData.click_action || '/ibento/eventos';
      }
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
              url: targetUrl,
              notificationType: notificationType,
              action: action,
              data: notificationData
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

// 🔥 FUNCIÓN PARA MOSTRAR NOTIFICACIONES LOCALES DE DATING APP 🔥
async function showDatingNotification(type, data) {
  const notifications = {
    match: {
      title: '🎉 ¡Nuevo Match!',
      body: `¡Hiciste match con ${data.userName}! ¡Comienza a chatear!`,
      icon: data.userPhoto || '/icons/ibento192x192.png',
      vibrate: [500, 200, 500, 200, 500],
      actions: [
        { action: 'open_chat', title: '💬 Chatear', icon: '/icons/ibento48x48.png' },
        { action: 'view_profile', title: '👤 Ver perfil', icon: '/icons/ibento48x48.png' }
      ],
      tag: 'match-notification',
      badge: '/icons/ibentoba.png'
    },
    
    like: {
      title: '❤️ ¡Alguien te dio like!',
      body: `A ${data.userName} le gustas. ¡Dale like tú también para hacer match!`,
      icon: data.userPhoto || '/icons/ibento192x192.png',
      vibrate: [300, 100, 300],
      actions: [
        { action: 'like_back', title: '❤️ Dar like', icon: '/icons/ibento48x48.png' },
        { action: 'view_profile', title: '👤 Ver perfil', icon: '/icons/ibento48x48.png' }
      ],
      tag: 'like-notification',
      badge: '/icons/ibentoba.png'
    },
    
    message: {
      title: `💬 Mensaje de ${data.userName}`,
      body: data.message.length > 50 ? data.message.substring(0, 50) + '...' : data.message,
      icon: data.userPhoto || '/icons/ibento192x192.png',
      vibrate: [200, 100, 200],
      actions: [
        { action: 'reply_quick', title: '💬 Responder', icon: '/icons/ibento48x48.png' },
        { action: 'open_chat', title: 'Abrir chat', icon: '/icons/ibento48x48.png' }
      ],
      tag: `message-${data.userId}`,
      badge: '/icons/ibentoba.png'
    },
    
    verification_complete: {
      title: '✅ ¡Verificación completada!',
      body: 'Tu perfil ha sido verificado. ¡Ya puedes buscar matches!',
      icon: '/icons/ibento192x192.png',
      vibrate: [400, 200, 400],
      actions: [
        { action: 'start_matching', title: '🔍 Buscar matches', icon: '/icons/ibento48x48.png' },
        { action: 'view_profile', title: '👤 Mi perfil', icon: '/icons/ibento48x48.png' }
      ],
      tag: 'verification-notification',
      badge: '/icons/ibentoba.png'
    }
  };

  const config = notifications[type];
  if (!config) return;

  const notificationOptions = {
    ...config,
    data: {
      type,
      timestamp: Date.now(),
      ...data
    },
    requireInteraction: true
  };

  await self.registration.showNotification(config.title, notificationOptions);
}

// 🔥 MENSAJES DEL CLIENTE MEJORADOS 🔥
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Responder con información del SW
  if (event.data && event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        version: 'workbox-managed-dating',
        ready: true,
        datingFeatures: true
      });
    }
  }

  // 🔥 MOSTRAR NOTIFICACIÓN DE DATING DESDE EL CLIENTE 🔥
  if (event.data && event.data.type === 'SHOW_DATING_NOTIFICATION') {
    showDatingNotification(event.data.notificationType, event.data.data)
      .then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
      .catch(error => {
        console.error('[SW] Error showing dating notification:', error);
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: false, error: error.message });
        }
      });
  }
  
  // Cachear datos de usuario manualmente
  if (event.data && event.data.type === 'CACHE_USER_DATA') {
    cacheUserSession(event.data.userData);
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }
  
  // Obtener datos de usuario del cache
  if (event.data && event.data.type === 'GET_CACHED_USER') {
    getCachedUserSession().then(userData => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ userData });
      }
    });
  }
  
  // Cachear datos de eventos manualmente
  if (event.data && event.data.type === 'CACHE_EVENTS_DATA') {
    cacheEventsData(event.data.eventsData, event.data.cacheKey);
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }
  
  // Obtener datos de eventos del cache
  if (event.data && event.data.type === 'GET_CACHED_EVENTS') {
    getCachedEventsData(event.data.cacheKey).then(eventsData => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ eventsData });
      }
    });
  }
  
  // Limpiar datos expirados
  if (event.data && event.data.type === 'CLEAN_EXPIRED_DATA') {
    cleanExpiredData().then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
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

// ================== FUNCIONALIDAD OFFLINE OPTIMIZADA PARA MÓVILES (TU CÓDIGO ORIGINAL) ==================

// Cache de datos de usuario y eventos para funcionalidad offline
const OFFLINE_DATA_CACHE = 'offline-data-v1';
const USER_SESSION_CACHE = 'user-session-v1';
const EVENTS_DATA_CACHE = 'events-data-v1';
const MOBILE_CACHE = 'mobile-optimized-v1';
const DATING_DATA_CACHE = 'dating-data-v1'; // 🔥 NUEVO CACHE PARA DATING

// Detectar si es dispositivo móvil
function isMobileDevice() {
  return self.registration && self.registration.scope.includes('mobile') ||
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 🔥 FUNCIÓN PARA CACHEAR DATOS DE DATING APP 🔥
async function cacheDatingData(dataType, data) {
  try {
    const cache = await caches.open(DATING_DATA_CACHE);
    const expirationTime = isMobileDevice() ? 
      (30 * 60 * 1000) :  // 30 minutos para móviles
      (60 * 60 * 1000);   // 1 hora para desktop
    
    await cache.put(`/dating-${dataType}`, new Response(JSON.stringify({
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + expirationTime,
      isMobile: isMobileDevice()
    })));
    console.log(`[SW] Dating data cached for type: ${dataType}`);
  } catch (error) {
    console.error('[SW] Error caching dating data:', error);
  }
}

// Función para cachear datos de usuario con optimización móvil
async function cacheUserSession(userData) {
  try {
    const cache = await caches.open(USER_SESSION_CACHE);
    const expirationTime = isMobileDevice() ? 
      (12 * 60 * 60 * 1000) : // 12 horas para móviles (menor para ahorrar espacio)
      (24 * 60 * 60 * 1000);  // 24 horas para desktop
    
    await cache.put('/user-session', new Response(JSON.stringify({
      user: userData,
      timestamp: Date.now(),
      expires: Date.now() + expirationTime,
      isMobile: isMobileDevice()
    })));
    console.log('[SW] User session cached (mobile optimized)');
  } catch (error) {
    console.error('[SW] Error caching user session:', error);
  }
}

// Función para obtener sesión de usuario del cache
async function getCachedUserSession() {
  try {
    const cache = await caches.open(USER_SESSION_CACHE);
    const response = await cache.match('/user-session');
    if (response) {
      const data = await response.json();
      if (data.expires > Date.now()) {
        return data.user;
      } else {
        // Sesión expirada, limpiar
        await cache.delete('/user-session');
      }
    }
    return null;
  } catch (error) {
    console.error('[SW] Error getting cached user session:', error);
    return null;
  }
}

// Función para cachear eventos con optimización móvil
async function cacheEventsData(eventsData, cacheKey) {
  try {
    const cache = await caches.open(EVENTS_DATA_CACHE);
    const expirationTime = isMobileDevice() ? 
      (30 * 60 * 1000) :      // 30 minutos para móviles
      (60 * 60 * 1000);       // 1 hora para desktop
    
    // Limitar cantidad de eventos en móviles para ahorrar espacio
    let processedEvents = eventsData;
    if (isMobileDevice() && Array.isArray(eventsData) && eventsData.length > 20) {
      processedEvents = eventsData.slice(0, 20); // Solo los primeros 20 eventos
      console.log('[SW] Limited events for mobile device');
    }
    
    await cache.put(`/events-${cacheKey}`, new Response(JSON.stringify({
      events: processedEvents,
      timestamp: Date.now(),
      expires: Date.now() + expirationTime,
      isMobile: isMobileDevice(),
      limited: processedEvents !== eventsData
    })));
    console.log(`[SW] Events data cached for key: ${cacheKey} (mobile optimized)`);
  } catch (error) {
    console.error('[SW] Error caching events data:', error);
  }
}

// Función para obtener eventos del cache
async function getCachedEventsData(cacheKey) {
  try {
    const cache = await caches.open(EVENTS_DATA_CACHE);
    const response = await cache.match(`/events-${cacheKey}`);
    if (response) {
      const data = await response.json();
      if (data.expires > Date.now()) {
        return data.events;
      } else {
        // Datos expirados, limpiar
        await cache.delete(`/events-${cacheKey}`);
      }
    }
    return null;
  } catch (error) {
    console.error('[SW] Error getting cached events data:', error);
    return null;
  }
}

// Función para limpiar datos expirados con optimización móvil
async function cleanExpiredData() {
  try {
    const cacheNames = [USER_SESSION_CACHE, EVENTS_DATA_CACHE, OFFLINE_DATA_CACHE, MOBILE_CACHE, DATING_DATA_CACHE];
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          try {
            const data = await response.json();
            if (data.expires && data.expires < Date.now()) {
              await cache.delete(request);
              console.log(`[SW] Expired data cleaned: ${request.url}`);
            }
          } catch (e) {
            // Si no se puede parsear como JSON, mantener el cache
          }
        }
      }
    }
    
    // Limpieza adicional para móviles - limitar tamaño total de cache
    if (isMobileDevice()) {
      await limitCacheSizeForMobile();
    }
  } catch (error) {
    console.error('[SW] Error cleaning expired data:', error);
  }
}

// Función para limitar el tamaño del cache en móviles
async function limitCacheSizeForMobile() {
  try {
    const maxCacheSize = 50 * 1024 * 1024; // 50 MB máximo para móviles
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    // Calcular tamaño total aproximado
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      totalSize += keys.length * 1024; // Estimación aproximada
    }
    
    // Si excede el límite, limpiar caches menos críticos
    if (totalSize > maxCacheSize) {
      console.log('[SW] Cache size limit exceeded on mobile, cleaning up...');
      
      // Limpiar cache de imágenes primero
      const imageCache = await caches.open('images-cache');
      const imageKeys = await imageCache.keys();
      
      // Eliminar las imágenes más antiguas
      for (let i = 0; i < Math.min(imageKeys.length / 2, 20); i++) {
        await imageCache.delete(imageKeys[i]);
      }
    }
  } catch (error) {
    console.error('[SW] Error limiting cache size for mobile:', error);
  }
}

// Interceptar respuestas de la API para cachear datos importantes
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ibento.onrender.com' && 
           (url.pathname.includes('/auth/login') || 
            url.pathname.includes('/auth/verify-token') ||
            url.pathname.includes('/usuarios/perfil'));
  },
  async ({ event }) => {
    const response = await fetch(event.request.clone());
    
    if (response.ok) {
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        // Cachear datos de usuario si la respuesta contiene información de usuario
        if (data.user || data.usuario) {
          await cacheUserSession(data.user || data.usuario);
        }
      } catch (error) {
        console.error('[SW] Error processing user data response:', error);
      }
    }
    
    return response;
  }
);

// Interceptar respuestas de eventos para cachear
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ibento.onrender.com' && 
           (url.pathname.includes('/eventos/most_liked') || 
            url.pathname.includes('/eventos/recommended_events') ||
            url.pathname.includes('/eventos/upcoming_events') ||
            url.pathname.includes('/usuarios/eventos_cerca'));
  },
  async ({ event }) => {
    const response = await fetch(event.request.clone());
    
    if (response.ok) {
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        // Determinar clave de cache basada en la URL
        let cacheKey = 'general';
        if (event.request.url.includes('most_liked')) cacheKey = 'most_liked';
        else if (event.request.url.includes('recommended_events')) cacheKey = 'recommended';
        else if (event.request.url.includes('upcoming_events')) cacheKey = 'upcoming';
        else if (event.request.url.includes('eventos_cerca')) cacheKey = 'nearby';
        
        // Cachear eventos
        if (data.eventos || data.events || Array.isArray(data)) {
          await cacheEventsData(data.eventos || data.events || data, cacheKey);
        }
      } catch (error) {
        console.error('[SW] Error processing events data response:', error);
      }
    }
    
    return response;
  }
);

// Manejar solicitudes offline
self.addEventListener('fetch', event => {
  // Solo para solicitudes de API cuando esté offline
  if (event.request.url.includes('ibento.onrender.com') && 
      event.request.url.includes('/api/')) {
    
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Si falla la red, intentar responder desde cache
        const url = new URL(event.request.url);
        
        // Respuestas de usuario offline
        if (url.pathname.includes('/auth/verify-token') || 
            url.pathname.includes('/usuarios/perfil')) {
          const cachedUser = await getCachedUserSession();
          if (cachedUser) {
            return new Response(JSON.stringify({
              success: true,
              user: cachedUser,
              offline: true,
              message: 'Datos cargados desde cache offline'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Respuestas de eventos offline
        if (url.pathname.includes('/eventos/')) {
          let cacheKey = 'general';
          if (url.pathname.includes('most_liked')) cacheKey = 'most_liked';
          else if (url.pathname.includes('recommended_events')) cacheKey = 'recommended';
          else if (url.pathname.includes('upcoming_events')) cacheKey = 'upcoming';
          else if (url.pathname.includes('eventos_cerca')) cacheKey = 'nearby';
          
          const cachedEvents = await getCachedEventsData(cacheKey);
          if (cachedEvents) {
            return new Response(JSON.stringify({
              eventos: cachedEvents,
              offline: true,
              message: 'Eventos cargados desde cache offline'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Si no hay datos en cache, devolver error offline
        return new Response(JSON.stringify({
          error: 'Sin conexión a internet',
          offline: true,
          message: 'Por favor verifica tu conexión a internet'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  }
});

// Limpiar datos expirados cada hora
setInterval(cleanExpiredData, 60 * 60 * 1000);

console.log('[SW] Service Worker loaded with Workbox + Firebase + Dating App functionality');