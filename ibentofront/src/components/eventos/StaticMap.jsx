import React from 'react';

const StaticMap = ({ location, width = '100%', height = '300px' }) => {
  // Coordenadas por defecto (Autódromo Hermanos Rodríguez)
  const defaultCenter = {
    lat: 19.4042,
    lng: -99.0907
  };

  // Parsear coordenadas
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

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return defaultCenter;
    }

    return { lat, lng };
  };

  const center = parseCoordinates(location);
  
  // URL para mapa estático de OpenStreetMap
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng-0.01}%2C${center.lat-0.01}%2C${center.lng+0.01}%2C${center.lat+0.01}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;

  return (
    <div 
      style={{ width, height }} 
      className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
    >
      <iframe
        src={mapUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Mapa de ubicación"
        loading="lazy"
      />
      
      {/* Overlay con información */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        📍 {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
      </div>
      
      {/* Enlace para abrir en maps */}
      <div className="absolute bottom-2 right-2">
        <a
          href={`https://www.google.com/maps?q=${center.lat},${center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
        >
          Ver en Maps
        </a>
      </div>
    </div>
  );
};

export default StaticMap;
