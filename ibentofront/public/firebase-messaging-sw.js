// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyyjUbVeB-gewCIkbM",
  authDomain: "ibento-8e4fc.firebaseapp.com",
  projectId: "ibento-8e4fc",
  storageBucket: "ibento-8e4fc.firebasestorage.app",
  messagingSenderId: "15635743",
  appId: "1:156357411233:web:dafd174c43cbe0",
  measurementId: "G-MZJSYRXE4E"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Recibido mensaje:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/ibento192x192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
