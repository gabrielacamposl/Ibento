import React, { use } from 'react';
import Carousel from './components/carousel';
import Cards from './components/cards';
import SearchMenu from './components/menu';
import CircularDemo from './components/carousel2';


import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchEvents } from '../../hooks/usefetchEvents';
import useGeolocation from '../../hooks/useGeolocation';
import api from '../../api';
import { Sidebar } from 'primereact/sidebar';

import { BellDot, Search } from 'lucide-react';


function Page() {

    const navigate = useNavigate();

    //const {data: eventos, loading, error } = useFetchEvents('http://127.0.0.1:8000/eventos/everything/');
    const { data: popularEvents, loading: popularLoading, error: popularError } = useFetchEvents('http://127.0.0.1:8000/eventos/most_liked/');

    const [usuarioName, setUsuarioName] = useState('');
    const [visible, setVisible] = useState(false);

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
                <span className="text-black loading loading-ring loading-xl"></span>
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

    return (
        <>
            <div className="flex flex-col gap-4 min-h-screen justify-center w-full  items-center bg-white lg:max-w-3/4">
                <div className="flex gap-4 w-full items-center h-16  border border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-center text-black text-nowrap">Bienvenido {usuarioName}!</h1>
                    <div className='flex w-full flex-row gap-4 justify-end mr-4'>
                        <div className="card flex justify-content-center">
                            <Sidebar visible={visible} onHide={() => setVisible(false)} fullScreen>
                                <h2>Sidebar</h2>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                            </Sidebar>
                            <Search className="w-6 h-6 text-black align-left hover:text-purple-700 cursor-pointer" onClick={() => navigate('../busqueda')} />
                        </div>
                        {/* <Search className="w-6 h-6 text-black align-left hover:text-purple-700 cursor-pointer" onClick={() => navigate('/buscador')}/> */}
                        <BellDot className="w-6 h-6 text-black align-left hover:text-purple-700 cursor-pointer" onClick={() => setVisible(true)} />
                    </div>
                </div>
                <CircularDemo />
                {/* <Carousel /> */}
                {/* <Cards listEvents = {eventosRecomendados} name = {"Recomendados para ti"} /> */}
                <Cards listEvents={popularEvents} name={"Populares"} />
                <SearchMenu />
                <div className='h-16'></div>
            </div>

        </>
    )

}

export default Page;