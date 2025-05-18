
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

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/ibento.png',
      badge: '/icons/ibentoba.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(clients.openWindow('https://ibento-hazel.vercel.app/eventos/recomended_eventos'));
});

self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (EVENT_API_URLS.some(apiUrl => request.url.startsWith(apiUrl))) {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request).then(res => {
            const resClone = res.clone();
            caches.open(CACHE_EVENTOS).then(cache => cache.put(request, resClone));
            return res;
          })
        );
      })
    );
    return;
  }

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
