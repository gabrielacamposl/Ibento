import React from 'react';
import Carousel from './carousel';
import Cards from './cards';
import SearchMenu from './menu';
import axios from 'axios';
import { useEffect, useState } from 'react';
import useFetchEvents from '../../hooks/fetchEvents';
import useGeolocation from '../../hooks/useGeolocation';

function Page(){


    const { data: eventos, loading, error } = useFetchEvents('http://127.0.0.1:8000/eventos/');

    const { position, error: geoError, loading: geoLoading } = useGeolocation();

    useEffect(() => {
      if (position) {
          console.log("Ubicación obtenida en el componente Page:", position.coords.latitude, position.coords.longitude);
          // Aquí podrías, por ejemplo, filtrar eventos por distancia si tu API lo permite
      }
  }, [position]); // Este efecto se ejecutará cuando la posición cambie (es decir, cuando se obtenga)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    
    if (loading || geoLoading) {
      return (
          <div className="flex min-h-screen justify-center items-center">
              <p>Cargando...</p> {/* Puedes usar un spinner o un mensaje más elaborado */}
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex min-h-screen justify-center items-center text-red-600">
              <p>Error al cargar eventos: {error}</p>
          </div>
      );
  }

  if (geoError) {
       return (
          <div className="flex min-h-screen justify-center items-center text-yellow-600">
              <p>Error al obtener ubicación: {geoError.message}</p>
              {/* Opcional: renderizar la página sin geolocalización */}
              {/* ... renderiza el resto de la página aquí ... */}
          </div>
      );
  }

    return(
        <>
        <div className="flex flex-col gap-4 min-h-screen justify-center w-full items-center bg-white lg:max-w-3/4">
            <Carousel />
            <Cards listEvents = {eventos} name = {"recomendados"} />
            <Cards listEvents = {eventos} name = {"populares"} />
            <SearchMenu listEvents = {eventos}/>
            <div className='h-16'></div>
        </div>
        
        </>
    )

}

export default Page;