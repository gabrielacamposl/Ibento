// src/utils/universalNotifications.js
// SERVICIO UNIVERSAL QUE FUNCIONA EN TODAS LAS PLATAFORMAS

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Tu configuración Firebase existente
const firebaseConfig = {
  apiKey: "AIzaSyC9cLzJYYBPB1ERFyjUrnbVeB-gewCIkbM",
  authDomain: "ibento-8e4fc.firebaseapp.com",
  projectId: "ibento-8e4fc",
  storageBucket: "ibento-8e4fc.firebasestorage.app",
  messagingSenderId: "156357411233",
  appId: "1:156357411233:web:dafd393eebb9174c43cbe0",
  measurementId: "G-MZJSYRXE4E"
};

class UniversalNotificationService {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.registration = null;
    this.fcmToken = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    this.isInitialized = false;
    this.platform = this.detectPlatform();
    this.notificationQueue = []; // Para iOS fallback
  }

  // 🔍 DETECTAR PLATAFORMA AUTOMÁTICAMENTE
  detectPlatform() {
    const userAgent = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return window.navigator.standalone ? 'ios-pwa' : 'ios-safari';
    }
    
    if (/Android/.test(userAgent)) {
      return window.matchMedia('(display-mode: standalone)').matches ? 'android-pwa' : 'android-browser';
    }
    
    if (/Windows/.test(userAgent)) {
      return 'windows';
    }
    
    if (/Macintosh/.test(userAgent)) {
      return 'macos';
    }
    
    return 'desktop';
  }

  // 🚀 INICIALIZAR SERVICIO UNIVERSAL
  async initialize() {
    try {
      console.log(`🔧 Inicializando para plataforma: ${this.platform}`);

      if (!this.isSupported) {
        console.warn('❌ Notificaciones no soportadas en este navegador');
        return this.initializeFallback();
      }

      // Inicializar Service Worker
      this.registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker listo');

      // Inicializar Firebase según plataforma
      await this.initializeFirebase();

      // Pedir permisos
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Permisos denegados, usando fallback');
        return this.initializeFallback();
      }

      // Configurar listeners específicos por plataforma
      this.setupPlatformListeners();

      this.isInitialized = true;
      console.log(`✅ Servicio inicializado correctamente para ${this.platform}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar:', error);
      return this.initializeFallback();
    }
  }

  // 🔥 INICIALIZAR FIREBASE (si es necesario)
  async initializeFirebase() {
    try {
      // Solo inicializar Firebase en plataformas que lo soportan bien
      if (this.platform.includes('android') || this.platform === 'windows' || this.platform === 'desktop') {
        if (!this.app) {
          try {
            this.app = initializeApp(firebaseConfig);
          } catch (error) {
            if (error.code === 'app/duplicate-app') {
              const { getApps } = await import('firebase/app');
              this.app = getApps()[0];
            } else {
              throw error;
            }
          }
        }

        this.messaging = getMessaging(this.app);
        await this.getFirebaseToken();
      }
    } catch (error) {
      console.warn('⚠️ Firebase no disponible, continuando sin FCM:', error);
    }
  }

  // 🔔 PEDIR PERMISOS UNIVERSAL
  async requestPermission() {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    // En iOS PWA, mostrar explicación antes de pedir permisos
    if (this.platform === 'ios-pwa') {
      const userConfirmed = confirm(
        '¿Quieres recibir notificaciones de matches, likes y mensajes?\n\n' +
        'Toca "Permitir" en el siguiente popup para activarlas.'
      );
      
      if (!userConfirmed) {
        return 'denied';
      }
    }

    const permission = await Notification.requestPermission();
    console.log(`🔔 Permisos ${this.platform}:`, permission);
    
    return permission;
  }

  // 🎧 CONFIGURAR LISTENERS POR PLATAFORMA
  setupPlatformListeners() {
    switch (this.platform) {
      case 'android-pwa':
      case 'android-browser':
        this.setupAndroidListeners();
        break;
      case 'ios-pwa':
      case 'ios-safari':
        this.setupiOSListeners();
        break;
      case 'windows':
      case 'macos':
      case 'desktop':
        this.setupDesktopListeners();
        break;
    }

    // Listener universal para navegación desde notificaciones
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NAVIGATE') {
        this.handleNavigationFromNotification(event.data);
      }
    });
  }

  // 🤖 LISTENERS ANDROID
  setupAndroidListeners() {
    if (this.messaging) {
      onMessage(this.messaging, (payload) => {
        console.log('🤖 Notificación Android recibida:', payload);
        this.handleForegroundNotification(payload);
      });
    }
  }

  // 🍎 LISTENERS iOS
  setupiOSListeners() {
    // En iOS, principalmente eventos personalizados
    console.log('🍎 iOS listeners configurados');
  }

  // 💻 LISTENERS DESKTOP
  setupDesktopListeners() {
    if (this.messaging) {
      onMessage(this.messaging, (payload) => {
        console.log('💻 Notificación Desktop recibida:', payload);
        this.handleForegroundNotification(payload);
      });
    }
  }

  // 📤 OBTENER TOKEN FIREBASE
  async getFirebaseToken() {
    try {
      if (this.messaging && this.registration) {
        this.fcmToken = await getToken(this.messaging, {
          serviceWorkerRegistration: this.registration
        });

        if (this.fcmToken) {
          console.log('✅ Token FCM obtenido:', this.fcmToken.substring(0, 20) + '...');
          localStorage.setItem('fcm_token', this.fcmToken);
          await this.sendTokenToServer(this.fcmToken);
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener token FCM:', error);
    }
  }

  // 📡 ENVIAR TOKEN AL SERVIDOR
  async sendTokenToServer(token) {
    try {
      // Aquí enviarías el token a tu backend
      console.log('📤 Token enviado al servidor (simulado)');
      return true;
    } catch (error) {
      console.warn('⚠️ Error enviando token al servidor:', error);
    }
  }

  // 🚨 FALLBACK PARA PLATAFORMAS NO SOPORTADAS
  initializeFallback() {
    console.log('⚡ Inicializando modo fallback');
    this.isInitialized = true;
    return true;
  }

  // 📱 NOTIFICACIONES UNIVERSALES

  // 🎉 MATCH - FUNCIONA EN TODAS LAS PLATAFORMAS
  async notifyMatch(userName, userPhoto = null, userId = null) {
    const data = { userName, userPhoto, userId, type: 'match' };

    console.log(`🎉 Enviando notificación Match en ${this.platform}`);

    switch (this.platform) {
      case 'ios-pwa':
      case 'ios-safari':
        return await this.notifyiOS('match', data);
        
      case 'android-pwa':
      case 'android-browser':
        return await this.notifyAndroid('match', data);
        
      case 'windows':
      case 'macos':
      case 'desktop':
        return await this.notifyDesktop('match', data);
        
      default:
        return await this.notifyFallback('match', data);
    }
  }

  // ❤️ LIKE - FUNCIONA EN TODAS LAS PLATAFORMAS
  async notifyLike(userName, userPhoto = null, userId = null) {
    const data = { userName, userPhoto, userId, type: 'like' };

    console.log(`❤️ Enviando notificación Like en ${this.platform}`);

    switch (this.platform) {
      case 'ios-pwa':
      case 'ios-safari':
        return await this.notifyiOS('like', data);
        
      case 'android-pwa':
      case 'android-browser':
        return await this.notifyAndroid('like', data);
        
      case 'windows':
      case 'macos':
      case 'desktop':
        return await this.notifyDesktop('like', data);
        
      default:
        return await this.notifyFallback('like', data);
    }
  }

  // 💬 MESSAGE - FUNCIONA EN TODAS LAS PLATAFORMAS
  async notifyMessage(userName, message, userPhoto = null, userId = null) {
    const data = { userName, message, userPhoto, userId, type: 'message' };

    console.log(`💬 Enviando notificación Message en ${this.platform}`);

    switch (this.platform) {
      case 'ios-pwa':
      case 'ios-safari':
        return await this.notifyiOS('message', data);
        
      case 'android-pwa':
      case 'android-browser':
        return await this.notifyAndroid('message', data);
        
      case 'windows':
      case 'macos':
      case 'desktop':
        return await this.notifyDesktop('message', data);
        
      default:
        return await this.notifyFallback('message', data);
    }
  }

  // 🍎 NOTIFICACIONES iOS (con múltiples métodos)
  async notifyiOS(type, data) {
    try {
      const { title, body, options } = this.getNotificationConfig(type, data);
      
      // Método 1: Service Worker (si está disponible)
      if (this.registration) {
        try {
          await this.registration.showNotification(title, options);
          console.log('✅ iOS: Notificación enviada via Service Worker');
        } catch (error) {
          console.warn('⚠️ iOS SW falló:', error);
        }
      }

      // Método 2: Notification API directa
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification(title, {
            body,
            icon: options.icon,
            tag: `ios-${type}-${Date.now()}`
          });

          notification.onclick = () => {
            window.focus();
            this.handleNotificationClick(type, data);
            notification.close();
          };

          console.log('✅ iOS: Notificación enviada via Notification API');
        } catch (error) {
          console.warn('⚠️ iOS Notification API falló:', error);
        }
      }

      // Método 3: Fallback visual en la app
      this.showInAppNotification(type, data);

      // Método 4: Vibración si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate(options.vibrate || [200, 100, 200]);
      }

      return true;
    } catch (error) {
      console.error('❌ Error notificación iOS:', error);
      return this.notifyFallback(type, data);
    }
  }

  // 🤖 NOTIFICACIONES ANDROID
  async notifyAndroid(type, data) {
    try {
      const { title, body, options } = this.getNotificationConfig(type, data);
      
      if (this.registration) {
        await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
          notificationType: type,
          data
        });
        console.log('✅ Android: Notificación enviada via Service Worker');
      } else {
        // Fallback Notification API
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: options.icon });
          console.log('✅ Android: Notificación enviada via Notification API');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error notificación Android:', error);
      return this.notifyFallback(type, data);
    }
  }

  // 💻 NOTIFICACIONES DESKTOP
  async notifyDesktop(type, data) {
    try {
      const { title, body, options } = this.getNotificationConfig(type, data);
      
      if (this.registration) {
        await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
          notificationType: type,
          data
        });
        console.log('✅ Desktop: Notificación enviada via Service Worker');
      } else {
        if (Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body,
            icon: options.icon,
            tag: `desktop-${type}`
          });

          notification.onclick = () => {
            window.focus();
            this.handleNotificationClick(type, data);
            notification.close();
          };

          console.log('✅ Desktop: Notificación enviada via Notification API');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error notificación Desktop:', error);
      return this.notifyFallback(type, data);
    }
  }

  // 🆘 FALLBACK UNIVERSAL (siempre funciona)
  async notifyFallback(type, data) {
    const { title, body } = this.getNotificationConfig(type, data);
    
    // Método 1: Alert nativo (siempre funciona)
    alert(`${title}\n${body}`);
    
    // Método 2: Notificación visual en la app
    this.showInAppNotification(type, data);
    
    // Método 3: Evento personalizado
    window.dispatchEvent(new CustomEvent(`notification:${type}`, { detail: data }));
    
    console.log('✅ Fallback: Notificación mostrada');
    return true;
  }

  // 🎨 NOTIFICACIÓN VISUAL EN LA APP
  showInAppNotification(type, data) {
    const { title, body } = this.getNotificationConfig(type, data);
    
    // Crear elemento visual
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ec4899, #be185d);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      cursor: pointer;
      animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${body}</div>
    `;
    
    notification.onclick = () => {
      this.handleNotificationClick(type, data);
      notification.remove();
    };
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // ⚙️ CONFIGURACIÓN DE NOTIFICACIONES
  getNotificationConfig(type, data) {
    const configs = {
      match: {
        title: '🎉 ¡Nuevo Match!',
        body: `¡Hiciste match con ${data.userName}! ¡Comienza a chatear!`,
        options: {
          icon: data.userPhoto || '/icons/ibento192x192.png',
          badge: '/icons/ibentoba.png',
          vibrate: [500, 200, 500, 200, 500],
          tag: 'match',
          requireInteraction: true,
          actions: [
            { action: 'open_chat', title: '💬 Chatear' },
            { action: 'view_profile', title: '👤 Ver perfil' }
          ],
          data: { type: 'match', ...data }
        }
      },
      like: {
        title: '❤️ ¡Alguien te dio like!',
        body: `A ${data.userName} le gustas. ¡Dale like tú también!`,
        options: {
          icon: data.userPhoto || '/icons/ibento192x192.png',
          badge: '/icons/ibentoba.png',
          vibrate: [300, 100, 300],
          tag: 'like',
          requireInteraction: true,
          actions: [
            { action: 'like_back', title: '❤️ Dar like' },
            { action: 'view_profile', title: '👤 Ver perfil' }
          ],
          data: { type: 'like', ...data }
        }
      },
      message: {
        title: `💬 Mensaje de ${data.userName}`,
        body: data.message?.length > 50 ? data.message.substring(0, 50) + '...' : data.message,
        options: {
          icon: data.userPhoto || '/icons/ibento192x192.png',
          badge: '/icons/ibentoba.png',
          vibrate: [200, 100, 200],
          tag: `message-${data.userId}`,
          requireInteraction: true,
          actions: [
            { action: 'reply', title: '💬 Responder' },
            { action: 'open_chat', title: 'Abrir chat' }
          ],
          data: { type: 'message', ...data }
        }
      }
    };

    return configs[type] || configs.match;
  }

  // 👆 MANEJAR CLICKS EN NOTIFICACIONES
  handleNotificationClick(type, data) {
    console.log(`👆 Click en notificación ${type}:`, data);
    
    const routes = {
      match: `/ibento/chat?userId=${data.userId}`,
      like: '/ibento/verLike',
      message: `/ibento/chat?userId=${data.userId}`
    };

    const targetUrl = routes[type] || '/ibento/eventos';
    
    if (window.location.pathname !== targetUrl) {
      window.location.href = targetUrl;
    }
  }

  // 🧭 MANEJAR NAVEGACIÓN DESDE SERVICE WORKER
  handleNavigationFromNotification(data) {
    if (data.url && window.location.pathname !== data.url) {
      window.location.href = data.url;
    }
  }

  // 📤 ENVIAR MENSAJE AL SERVICE WORKER
  async sendMessageToServiceWorker(type, data) {
    if (!this.registration?.active) {
      throw new Error('Service Worker no disponible');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        event.data.success ? resolve(event.data) : reject(new Error(event.data.error));
      };

      setTimeout(() => reject(new Error('Timeout Service Worker')), 5000);

      this.registration.active.postMessage({ type, ...data }, [messageChannel.port2]);
    });
  }

  // 📊 OBTENER ESTADO DEL SERVICIO
  getStatus() {
    return {
      platform: this.platform,
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      hasPermission: Notification.permission === 'granted',
      hasToken: !!this.fcmToken,
      hasServiceWorker: !!this.registration,
      notificationMethod: this.getNotificationMethod()
    };
  }

  getNotificationMethod() {
    if (!this.isInitialized) return 'none';
    
    switch (this.platform) {
      case 'ios-pwa':
        return 'ios-multi-method';
      case 'ios-safari':
        return 'ios-limited';
      case 'android-pwa':
        return 'android-full';
      case 'android-browser':
        return 'android-basic';
      case 'windows':
      case 'desktop':
        return 'desktop-full';
      default:
        return 'fallback';
    }
  }

  // 🧪 FUNCIÓN DE PRUEBA UNIVERSAL
  async testAllPlatforms() {
    console.log(`🧪 Probando notificaciones en ${this.platform}`);
    
    await this.notifyMatch('Test User', '/test.jpg', 'test123');
    
    setTimeout(async () => {
      await this.notifyLike('Test Liker', '/test2.jpg', 'test456');
    }, 2000);
    
    setTimeout(async () => {
      await this.notifyMessage('Test Sender', '¡Hola! ¿Cómo estás?', '/test3.jpg', 'test789');
    }, 4000);
  }
}

// Crear instancia única
const universalNotificationService = new UniversalNotificationService();

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.universalNotificationService = universalNotificationService;
  window.testAllNotifications = () => universalNotificationService.testAllPlatforms();
}

export default universalNotificationService;