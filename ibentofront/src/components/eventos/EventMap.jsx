import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const API_GOOGLE_MAPS = import.meta.env.VITE_API_KEY_GOOGLE;

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

const EventMap = ({ location }) => {
  // Coordenadas del Autódromo Hermanos Rodríguez (como ejemplo)
  const defaultCenter = {
    lat: 19.4042,
    lng: -99.0907
  };

  // Usa la ubicación proporcionada o la ubicación predeterminada
  const center = location || defaultCenter;

  return (
    <LoadScript googleMapsApiKey={API_GOOGLE_MAPS}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default EventMap;
