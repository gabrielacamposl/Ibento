import { useState, useEffect } from 'react';

interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prevState) => ({
        ...prevState,
        error: {
          code: 2,
          message: 'Geolocalización no soportada por este navegador.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
        loading: false,
      }));
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      console.log('Latitud:', position.coords.latitude);
      console.log('Longitud:', position.coords.longitude);
      setState({
        position,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      console.error('Error al obtener la ubicación:', error);
      setState((prevState) => ({
        ...prevState,
        error,
        loading: false,
      }));
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);

  }, []);

  return state;
};

export default useGeolocation;
