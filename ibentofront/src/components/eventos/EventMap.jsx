import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import StaticMap from './StaticMap';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

const EventMap = ({ location }) => {
  const { isLoaded, isLoading, error, retry } = useGoogleMaps();
  const [mapInstance, setMapInstance] = useState(null);
  const [marker, setMarker] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const mapRef = useRef(null);

  // Coordenadas del Autódromo Hermanos Rodríguez (como ejemplo)
  const defaultCenter = {
    lat: 19.4042,
    lng: -99.0907
  };

  // Convertir coordenadas string a números si es necesario
  const parseCoordinates = (location) => {
    if (!location) return defaultCenter;
    
    let lat, lng;
    
    if (typeof location.lat === 'string') {
      lat = parseFloat(location.lat);
    } else {
      lat = location.lat;
    }
    
    if (typeof location.lng === 'string') {
      lng = parseFloat(location.lng);
    } else {
      lng = location.lng;
    }

    // Validar que las coordenadas sean válidas
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return defaultCenter;
    }

    return { lat, lng };
  };

  const center = parseCoordinates(location);

  // Inicializar el mapa cuando Google Maps esté cargado
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && mapRef.current && !mapInstance) {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 15,
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: 'cooperative'
        });

        const mapMarker = new window.google.maps.Marker({
          position: center,
          map: map,
          title: 'Ubicación del evento'
        });

        setMapInstance(map);
        setMarker(mapMarker);
        setShowFallback(false);
      } catch (err) {
        console.error('Error inicializando el mapa:', err);
        setShowFallback(true);
      }
    }
  }, [isLoaded, center, mapInstance]);

  // Actualizar posición del marcador cuando cambien las coordenadas
  useEffect(() => {
    if (mapInstance && marker) {
      marker.setPosition(center);
      mapInstance.setCenter(center);
    }
  }, [center, mapInstance, marker]);

  // Estados de carga
  if (isLoading) {
    return (
      <div 
        style={containerStyle} 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  // Estado de error - mostrar fallback con opción de reintentar
  if (error || showFallback) {
    return (
      <div className="space-y-3">
        {/* Mostrar mapa estático como fallback */}
        <StaticMap location={location} height="300px" />
        
        {/* Mensaje de error y botón de reintento solo si hay error */}
        {error && (
          <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-gray-600 text-xs mb-2">
              ⚠️ Google Maps no pudo cargar: {error}
            </p>
            <button 
              onClick={() => {
                setShowFallback(false);
                retry();
              }}
              className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
            >
              Reintentar Google Maps
            </button>
          </div>
        )}
      </div>
    );
  }

  // Mapa cargado exitosamente
  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={containerStyle}
        className="rounded-lg overflow-hidden shadow-sm border border-gray-200"
      />
      
      {/* Información adicional */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        📍 {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
      </div>
    </div>
  );
};

export default EventMap;
