import React, { use } from 'react';
import Carousel from './carousel';
import Cards from './cards';
import SearchMenu from './menu';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useFetchEvents} from '../../hooks/usefetchEvents';
import useGeolocation from '../../hooks/useGeolocation';
import api from '../../api';

function Page(){

    const navigate = useNavigate();

    //const {data: eventos, loading, error } = useFetchEvents('http://127.0.0.1:8000/eventos/everything/');
    const {data : popularEvents, loading : popularLoading, error : popularError} = useFetchEvents('http://127.0.0.1:8000/eventos/most_liked/');

    const [usuarioName, setUsuarioName] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     if (!token) {
    //         // Redirige si no hay token
    //         navigate("/login");
    //     }
    //     window.scrollTo(0, 0);
    // }, []);
    


    useEffect(() => {
        const token = localStorage.getItem("token");
        //const usuarioObj = localStorage.getItem("user")
        if (token) {
            setUsuarioName(token);
        }
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
        <div className="flex flex-row gap-4 w-full items-center justify-center border border-b border-gray-200">
            <h1 className="text-3xl font-bold text-center mt-4 text-black">Bienvenido {usuarioName}!</h1>

        </div>
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