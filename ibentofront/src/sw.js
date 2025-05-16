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

async function cacheEventosDestacados() {
  try {
    const res = await fetch('https://ibento-hazel.vercel.app/eventos/destacados');
    const eventos = await res.json();

    const cache = await caches.open(CACHE_EVENTOS);
    for (const evento of eventos) {
      try {
        const resEvento = await fetch(evento.url);
        if (resEvento.ok) {
          await cache.put(evento.url, resEvento.clone());
        }
      } catch (err) {
        console.warn('[SW] Error al cachear evento:', evento.url, err);
      }
    }
  } catch (err) {
    console.warn('[SW] No se pudo obtener la lista de eventos.', err);
  }
}

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
  event.waitUntil(clients.openWindow('https://ibento-hazel.vercel.app'));
});

self.addEventListener('install', event => {
  console.log('[SW] Install');
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

      await cacheEventosDestacados();

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

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
