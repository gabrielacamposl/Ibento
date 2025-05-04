import React from 'react';
import Carousel from './carousel';
import Cards from './cards';
import SearchMenu from './menu';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {useFetchEvents} from '../../hooks/usefetchEvents';
import useGeolocation from '../../hooks/useGeolocation';

function Page(){


    //const {data: eventos, loading, error } = useFetchEvents('http://127.0.0.1:8000/eventos/everything/');
    const {data : popularEvents, loading : popularLoading, error : popularError} = useFetchEvents('http://127.0.0.1:8000/eventos/most_liked/');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    
    if (popularLoading) {
        return (
          <div className="flex min-h-screen justify-center items-center">
            <span className="loading loading-ring loading-xl"></span>
          </div>
        );
    }

  if (popularError) {
      return (
          <div className="flex min-h-screen justify-center items-center text-red-600">
              <p>Error al cargar eventos: {popularError}</p>
          </div>
      );
  }

//   if (geoError) {
//        return (
//           <div className="flex min-h-screen justify-center items-center text-yellow-600">
//               <p>Error al obtener ubicación: {geoError.message}</p>
//               {/* Opcional: renderizar la página sin geolocalización */}
//               {/* ... renderiza el resto de la página aquí ... */}
//           </div>
//       );
//   }

    return(
        <>
        <div className="flex flex-col gap-4 min-h-screen justify-center w-full  items-center bg-white lg:max-w-3/4">
            <Carousel />
            {/* <Cards listEvents = {eventosRecomendados} name = {"Recomendados para ti"} /> */}
            <Cards listEvents = {popularEvents} name = {"Populares"} />
            <SearchMenu/>
            <div className='h-16'></div>
        </div>
        
        </>
    )

}

export default Page;