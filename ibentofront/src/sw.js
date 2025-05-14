self.addEventListener('push', function (event) {
    if (event.data) {
      const data = event.data.json()
      const options = {
        body: data.body,
        icon: data.icon || '/ibento_logo.png',
        badge: '/bts.jpeg',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '2',
        },
      }
      event.waitUntil(self.registration.showNotification(data.title, options))
    }
  })
   
  self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.')
    event.notification.close()
    event.waitUntil(clients.openWindow('<https://x.com>'))
  })

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Installing SW ...', e);
});
self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activating SW ...', e);
    return self.clients.claim();
});
self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetching...', e);
    e.respondWith(fetch(e.request));
});