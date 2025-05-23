// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC9cLzJYYBPB1ERFyjUrnbVeB-gewCIkbM",
  authDomain: "ibento-8e4fc.firebaseapp.com",
  projectId: "ibento-8e4fc",
  storageBucket: "ibento-8e4fc.firebasestorage.app",
  messagingSenderId: "15635743",
  appId: "1:156357411233:web:dafd174c43cbe0",
  measurementId: "G-MZJSYRXE4E"
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icons/ibento192x192.png',
    badge: '/icons/ibentoba.png',
    vibrate: [200, 100, 200],
    data: {
      click_action: payload.data?.click_action || '/',
      url: payload.data?.url || '/',
      type: payload.data?.type || 'general'
    },
    actions: [
      {
        action: 'open',
        title: 'Ver ahora'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ],
    tag: payload.data?.type || 'ibento-notification',
    renotify: true,
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  const clickAction = event.notification.data.click_action || '/';
  const notificationType = event.notification.data.type;
  
  let targetUrl = '/';
  
  // Redirigir según el tipo de notificación
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
      targetUrl = clickAction;
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Si ya hay una ventana abierta, enfocarla y navegar
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});