// Utilidades para funcionalidad offline y comunicación con Service Worker
import React from 'react';

class OfflineUtils {
  constructor() {
    this.sw = null;
    this.isOnline = navigator.onLine;
    this.isMobile = this.detectMobile();
    this.setupEventListeners();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }
  setupEventListeners() {
    // Detectar cambios en el estado de conexión
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyConnectionChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyConnectionChange(false);
    });

    // Eventos específicos para móviles
    if (this.isMobile) {
      // Detectar cuando la app pasa a background/foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // App volvió al foreground, verificar conexión
          setTimeout(() => {
            this.notifyConnectionChange(navigator.onLine);
          }, 100);
        }
      });

      // Detectar cambios en la conexión móvil
      if ('connection' in navigator) {
        navigator.connection.addEventListener('change', () => {
          this.notifyConnectionChange(navigator.onLine);
        });
      }
    }

    // Obtener referencia al Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        this.sw = registration.active;
      });
    }
  }

  notifyConnectionChange(isOnline) {
    // Disparar evento personalizado para que los componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('connectionChange', {
      detail: { isOnline }
    }));
  }

  // Comunicar con el Service Worker
  async sendMessageToSW(message) {
    if (!this.sw) {
      await navigator.serviceWorker.ready;
      this.sw = (await navigator.serviceWorker.ready).active;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      this.sw.postMessage(message, [messageChannel.port2]);
    });
  }

  // Cachear datos de usuario
  async cacheUserData(userData) {
    try {
      await this.sendMessageToSW({
        type: 'CACHE_USER_DATA',
        userData
      });
      console.log('User data cached successfully');
    } catch (error) {
      console.error('Error caching user data:', error);
    }
  }

  // Obtener datos de usuario del cache
  async getCachedUserData() {
    try {
      const response = await this.sendMessageToSW({
        type: 'GET_CACHED_USER'
      });
      return response.userData;
    } catch (error) {
      console.error('Error getting cached user data:', error);
      return null;
    }
  }

  // Cachear datos de eventos
  async cacheEventsData(eventsData, cacheKey = 'general') {
    try {
      await this.sendMessageToSW({
        type: 'CACHE_EVENTS_DATA',
        eventsData,
        cacheKey
      });
      console.log(`Events data cached successfully for key: ${cacheKey}`);
    } catch (error) {
      console.error('Error caching events data:', error);
    }
  }

  // Obtener datos de eventos del cache
  async getCachedEventsData(cacheKey = 'general') {
    try {
      const response = await this.sendMessageToSW({
        type: 'GET_CACHED_EVENTS',
        cacheKey
      });
      return response.eventsData;
    } catch (error) {
      console.error('Error getting cached events data:', error);
      return null;
    }
  }

  // Limpiar datos expirados
  async cleanExpiredData() {
    try {
      await this.sendMessageToSW({
        type: 'CLEAN_EXPIRED_DATA'
      });
      console.log('Expired data cleaned successfully');
    } catch (error) {
      console.error('Error cleaning expired data:', error);
    }
  }

  // Verificar si hay datos en cache para mostrar indicador offline
  async hasOfflineData() {
    const cachedUser = await this.getCachedUserData();
    const cachedEvents = await this.getCachedEventsData();
    return !!(cachedUser || cachedEvents);
  }
  // Obtener estado de conexión con información específica para móviles
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      swReady: !!this.sw,
      isMobile: this.isMobile,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      saveData: navigator.connection?.saveData || false
    };
  }

  // Hook personalizado para React
  useOfflineStatus() {
    const [isOnline, setIsOnline] = React.useState(this.isOnline);
    const [hasOfflineData, setHasOfflineData] = React.useState(false);

    React.useEffect(() => {
      const handleConnectionChange = (event) => {
        setIsOnline(event.detail.isOnline);
      };

      window.addEventListener('connectionChange', handleConnectionChange);

      // Verificar si hay datos offline disponibles
      this.hasOfflineData().then(setHasOfflineData);

      return () => {
        window.removeEventListener('connectionChange', handleConnectionChange);
      };
    }, []);

    return { isOnline, hasOfflineData };
  }
}

// Crear instancia singleton
const offlineUtils = new OfflineUtils();

export default offlineUtils;

// Componente React para mostrar estado de conexión optimizado para móviles
export const ConnectionStatus = ({ className = '' }) => {
  const [status, setStatus] = React.useState(offlineUtils.getConnectionStatus());

  React.useEffect(() => {
    const handleConnectionChange = (event) => {
      setStatus(prev => ({
        ...prev,
        isOnline: event.detail.isOnline
      }));
    };

    window.addEventListener('connectionChange', handleConnectionChange);

    return () => {
      window.removeEventListener('connectionChange', handleConnectionChange);
    };
  }, []);

  if (status.isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="font-medium">
          {status.isMobile ? 'Sin conexión móvil' : 'Sin conexión'} - Modo offline
        </span>
        {status.isMobile && status.saveData && (
          <span className="text-xs opacity-75 ml-2">Ahorro de datos activado</span>
        )}
      </div>
    </div>
  );
};

// Hook personalizado para manejar requests con fallback offline optimizado para móviles
export const useOfflineRequest = () => {
  const makeRequest = async (url, options = {}, cacheKey = null) => {
    const connectionStatus = offlineUtils.getConnectionStatus();
    
    // Si estamos en móvil con ahorro de datos, priorizar cache
    if (connectionStatus.isMobile && connectionStatus.saveData) {
      console.log('Save data mode enabled, checking cache first...');
      
      // Intentar obtener datos del cache primero
      let cachedData = null;
      if (url.includes('/auth/') || url.includes('/usuarios/perfil')) {
        cachedData = await offlineUtils.getCachedUserData();
      } else if (url.includes('/eventos/') && cacheKey) {
        cachedData = await offlineUtils.getCachedEventsData(cacheKey);
      }
      
      if (cachedData) {
        console.log('Using cached data due to save data mode');
        return {
          data: cachedData,
          offline: false,
          cached: true,
          error: null,
          message: 'Datos cargados desde cache (modo ahorro de datos)'
        };
      }
    }
    
    try {
      // Timeout más corto para móviles para evitar esperas largas
      const timeoutMs = connectionStatus.isMobile ? 8000 : 15000;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Cachear automáticamente si es una respuesta exitosa
        if (cacheKey && data) {
          if (url.includes('/auth/') || url.includes('/usuarios/perfil')) {
            await offlineUtils.cacheUserData(data.user || data.usuario || data);
          } else if (url.includes('/eventos/')) {
            await offlineUtils.cacheEventsData(data.eventos || data.events || data, cacheKey);
          }
        }
        
        return { data, offline: false, error: null };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('Request failed, trying offline data...', error.message);
      
      // Intentar obtener datos del cache
      let cachedData = null;
      if (url.includes('/auth/') || url.includes('/usuarios/perfil')) {
        cachedData = await offlineUtils.getCachedUserData();
      } else if (url.includes('/eventos/') && cacheKey) {
        cachedData = await offlineUtils.getCachedEventsData(cacheKey);
      }
      
      if (cachedData) {
        return {
          data: cachedData,
          offline: true,
          error: null,
          message: connectionStatus.isMobile 
            ? 'Datos cargados desde cache móvil' 
            : 'Datos cargados desde cache offline'
        };
      } else {
        return {
          data: null,
          offline: true,
          error: error.name === 'AbortError' ? 'Timeout de conexión' : error.message || 'Error de conexión'
        };
      }
    }
  };

  return { makeRequest };
};
