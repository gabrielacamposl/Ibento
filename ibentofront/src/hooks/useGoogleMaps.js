import { useState, useEffect, useCallback } from 'react';

// Estado global para evitar múltiples cargas
let googleMapsState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  api: null
};

const subscribers = new Set();

const API_GOOGLE_MAPS = import.meta.env.VITE_API_KEY_GOOGLE;

export const useGoogleMaps = () => {
  const [state, setState] = useState(googleMapsState);

  useEffect(() => {
    // Subscribirse a cambios de estado
    const updateState = (newState) => {
      googleMapsState = { ...googleMapsState, ...newState };
      setState(googleMapsState);
    };

    subscribers.add(updateState);

    // Si ya está cargado, usar el estado actual
    if (googleMapsState.isLoaded) {
      setState(googleMapsState);
      return;
    }

    // Si ya se está cargando, esperar
    if (googleMapsState.isLoading) {
      setState(googleMapsState);
      return;
    }

    // Iniciar carga si no se ha iniciado
    loadGoogleMaps();

    return () => {
      subscribers.delete(updateState);
    };
  }, []);

  const notifySubscribers = useCallback((newState) => {
    subscribers.forEach(callback => callback(newState));
  }, []);

  const loadGoogleMaps = useCallback(async () => {
    if (!API_GOOGLE_MAPS) {
      const errorState = { 
        isLoading: false, 
        error: 'API key de Google Maps no encontrada' 
      };
      notifySubscribers(errorState);
      return;
    }

    if (googleMapsState.isLoading || googleMapsState.isLoaded) {
      return;
    }

    try {
      // Marcar como cargando
      notifySubscribers({ isLoading: true, error: null });

      // Verificar si Google Maps ya está cargado globalmente
      if (window.google && window.google.maps) {
        notifySubscribers({ 
          isLoaded: true, 
          isLoading: false, 
          error: null,
          api: window.google.maps
        });
        return;
      }

      // Crear el script de Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_GOOGLE_MAPS}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google && window.google.maps) {
          notifySubscribers({ 
            isLoaded: true, 
            isLoading: false, 
            error: null,
            api: window.google.maps
          });
        } else {
          notifySubscribers({ 
            isLoading: false, 
            error: 'Error al cargar Google Maps API' 
          });
        }
      };

      script.onerror = () => {
        notifySubscribers({ 
          isLoading: false, 
          error: 'Error de red al cargar Google Maps' 
        });
      };

      // Verificar si el script ya existe
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (!existingScript) {
        document.head.appendChild(script);
      }

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      notifySubscribers({ 
        isLoading: false, 
        error: 'Error inesperado al cargar Google Maps' 
      });
    }
  }, [notifySubscribers]);

  const retry = useCallback(() => {
    // Resetear estado y reintentar
    notifySubscribers({ 
      isLoaded: false, 
      isLoading: false, 
      error: null 
    });
    loadGoogleMaps();
  }, [loadGoogleMaps, notifySubscribers]);

  return {
    isLoaded: state.isLoaded,
    isLoading: state.isLoading,
    error: state.error,
    api: state.api,
    retry
  };
};
