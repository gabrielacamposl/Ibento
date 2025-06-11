import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC9cLzJYYBPB1ERFyjUrnbVeB-gewCIkbM",
  authDomain: "ibento-8e4fc.firebaseapp.com",
  projectId: "ibento-8e4fc",
  storageBucket: "ibento-8e4fc.firebasestorage.app",
  messagingSenderId: "156357411233",
  appId: "1:156357411233:web:dafd393eebb9174c43cbe0",
  measurementId: "G-MZJSYRXE4E"
};

class DatingNotificationService {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.registration = null;
    this.fcmToken = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    this.isInitialized = false;
  }

  // 1️⃣ INICIALIZAR EL SERVICIO
  async initialize() {
    try {
      if (!this.isSupported) {
        console.warn('❌ Las notificaciones no están soportadas en este navegador');
        return false;
      }

      console.log('🔧 Inicializando servicio de notificaciones dating...');

      // Esperar a que el Service Worker esté listo
      this.registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker listo:', this.registration);

      // Inicializar Firebase (sin duplicar si ya existe)
      if (!this.app) {
        // Verificar si ya existe una app Firebase
        try {
          this.app = initializeApp(firebaseConfig);
        } catch (error) {
          // Si ya existe, usar la existente
          if (error.code === 'app/duplicate-app') {
            const { getApps } = await import('firebase/app');
            this.app = getApps()[0];
          } else {
            throw error;
          }
        }
      }

      this.messaging = getMessaging(this.app);

      // Pedir permisos
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permisos de notificación denegados');
      }

      // Obtener token FCM
      await this.getFirebaseToken();

      // Configurar listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('✅ Servicio de notificaciones dating inicializado correctamente');
      
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar notificaciones dating:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // 2️⃣ PEDIR PERMISOS AL USUARIO
  async requestPermission() {
    if (Notification.permission === 'granted') {
      console.log('✅ Permisos ya otorgados');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permisos denegados permanentemente');
      throw new Error('Los permisos están bloqueados. Ve a configuración del navegador para habilitarlos.');
    }

    console.log('🔔 Pidiendo permisos...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permisos otorgados');
    } else {
      console.log('❌ Permisos denegados');
    }
    
    return permission;
  }

  // 3️⃣ OBTENER TOKEN DE FIREBASE
  async getFirebaseToken() {
    try {
      this.fcmToken = await getToken(this.messaging, {
        serviceWorkerRegistration: this.registration
      });

      if (this.fcmToken) {
        console.log('✅ Token FCM obtenido:', this.fcmToken);
        
        // Enviar token al servidor (opcional)
        await this.sendTokenToServer(this.fcmToken);
        
        // Guardar token localmente
        localStorage.setItem('fcm_token', this.fcmToken);
        
        return this.fcmToken;
      } else {
        throw new Error('No se pudo obtener el token FCM');
      }
    } catch (error) {
      console.error('❌ Error al obtener token FCM:', error);
      throw error;
    }
  }

  // 4️⃣ ENVIAR TOKEN AL SERVIDOR (OPCIONAL)
  async sendTokenToServer(token) {
    try {
      // Aquí puedes enviar el token a tu backend
      // const response = await api.post('/notifications/register-token/', {
      //   fcm_token: token,
      //   device_type: this.getDeviceType(),
      //   user_agent: navigator.userAgent
      // });
      
      console.log('📤 Token enviado al servidor (simulado)');
      return true;
    } catch (error) {
      console.error('❌ Error al enviar token al servidor:', error);
      // No lanzar error para no bloquear la funcionalidad local
    }
  }

  // 5️⃣ CONFIGURAR LISTENERS
  setupListeners() {
    // Escuchar notificaciones cuando la app está en primer plano
    onMessage(this.messaging, (payload) => {
      console.log('🔔 Notificación recibida en primer plano:', payload);
      
      const notificationType = payload.data?.type || 'general';
      
      // Mostrar notificación local inmediatamente
      this.handleForegroundNotification(payload);
      
      // Ejecutar callbacks específicos
      this.executeCallbacks(notificationType, payload.data);
    });

    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NAVIGATE') {
        console.log('🧭 Navegando desde notificación:', event.data);
        this.handleNavigationFromNotification(event.data);
      }
    });

    console.log('✅ Listeners configurados');
  }

  // 6️⃣ MANEJAR NOTIFICACIONES EN PRIMER PLANO
  async handleForegroundNotification(payload) {
    const notificationType = payload.data?.type || 'general';
    
    // Mostrar notificación usando el Service Worker
    await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
      notificationType,
      data: payload.data
    });
  }

  // 7️⃣ EJECUTAR CALLBACKS ESPECÍFICOS
  executeCallbacks(type, data) {
    // Disparar eventos personalizados que puedes escuchar en tu app
    switch(type) {
      case 'match':
        window.dispatchEvent(new CustomEvent('notification:match', { detail: data }));
        break;
      case 'like':
        window.dispatchEvent(new CustomEvent('notification:like', { detail: data }));
        break;
      case 'message':
        window.dispatchEvent(new CustomEvent('notification:message', { detail: data }));
        break;
      case 'verification_complete':
        window.dispatchEvent(new CustomEvent('notification:verification', { detail: data }));
        break;
    }
  }

  // 8️⃣ NOTIFICACIONES LOCALES ESPECÍFICAS PARA DATING

  // Match
  async notifyMatch(userName, userPhoto = null, userId = null) {
    const data = {
      userName,
      userPhoto,
      userId,
      type: 'match'
    };

    await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
      notificationType: 'match',
      data
    });

    // Disparar evento para la app
    window.dispatchEvent(new CustomEvent('notification:match', { detail: data }));
  }

  // Like recibido
  async notifyLike(userName, userPhoto = null, userId = null) {
    const data = {
      userName,
      userPhoto,
      userId,
      type: 'like'
    };

    await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
      notificationType: 'like',
      data
    });

    // Disparar evento para la app
    window.dispatchEvent(new CustomEvent('notification:like', { detail: data }));
  }

  // Mensaje recibido
  async notifyMessage(userName, message, userPhoto = null, userId = null) {
    const data = {
      userName,
      message,
      userPhoto,
      userId,
      type: 'message'
    };

    await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
      notificationType: 'message',
      data
    });

    // Disparar evento para la app
    window.dispatchEvent(new CustomEvent('notification:message', { detail: data }));
  }

  // Verificación completada
  async notifyVerificationComplete() {
    const data = {
      type: 'verification_complete'
    };

    await this.sendMessageToServiceWorker('SHOW_DATING_NOTIFICATION', {
      notificationType: 'verification_complete',
      data
    });

    // Disparar evento para la app
    window.dispatchEvent(new CustomEvent('notification:verification', { detail: data }));
  }

  // 9️⃣ ENVIAR MENSAJES AL SERVICE WORKER
  async sendMessageToServiceWorker(type, data) {
    if (!this.registration || !this.registration.active) {
      throw new Error('Service Worker no disponible');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data);
        } else {
          reject(new Error(event.data.error || 'Error en Service Worker'));
        }
      };

      // Timeout para evitar que se cuelgue
      setTimeout(() => {
        reject(new Error('Timeout al comunicarse con Service Worker'));
      }, 5000);

      this.registration.active.postMessage({
        type,
        ...data
      }, [messageChannel.port2]);
    });
  }

  // 🔟 MANEJAR NAVEGACIÓN DESDE NOTIFICACIONES
  handleNavigationFromNotification(data) {
    console.log('🧭 Navegando desde notificación:', data);
    
    // Aquí puedes usar React Router o tu sistema de navegación
    if (data.url && window.location.pathname !== data.url) {
      window.location.href = data.url;
    }
  }

  // 1️⃣1️⃣ FUNCIONES DE UTILIDAD

  getDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? 'mobile' : 'desktop';
  }

  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  // 1️⃣2️⃣ OBTENER ESTADO DEL SERVICIO
  getStatus() {
    return {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      hasPermission: Notification.permission === 'granted',
      permission: Notification.permission,
      hasToken: !!this.fcmToken,
      isInstalled: this.isInstalled(),
      deviceType: this.getDeviceType()
    };
  }

  // 1️⃣3️⃣ DESINICIALIZAR (para limpieza)
  destroy() {
    this.isInitialized = false;
    console.log('🧹 Servicio de notificaciones dating limpiado');
  }
}


// Crear instancia única (singleton)
const datingNotificationService = new DatingNotificationService();

export default datingNotificationService;

// 🔥 HOOK PERSONALIZADO PARA REACT 🔥
export const useDatingNotifications = () => {
  const [status, setStatus] = React.useState(datingNotificationService.getStatus());
  
  React.useEffect(() => {
    const updateStatus = () => setStatus(datingNotificationService.getStatus());
    
    // Actualizar estado cada 5 segundos
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    initialize: () => datingNotificationService.initialize(),
    notifyMatch: (userName, userPhoto, userId) => 
      datingNotificationService.notifyMatch(userName, userPhoto, userId),
    notifyLike: (userName, userPhoto, userId) => 
      datingNotificationService.notifyLike(userName, userPhoto, userId),
    notifyMessage: (userName, message, userPhoto, userId) => 
      datingNotificationService.notifyMessage(userName, message, userPhoto, userId),
    notifyVerificationComplete: () => 
      datingNotificationService.notifyVerificationComplete()
  };
};