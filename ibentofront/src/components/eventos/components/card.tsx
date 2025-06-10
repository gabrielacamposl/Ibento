
import React, { useState, useEffect, useMemo } from "react";
import { HeartIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import {useFetchEvents, useFetchNearestEvents} from '../../../hooks/usefetchEvents';
import useGeolocation from '../../../hooks/useGeolocation';


interface ListEvent {
    _id: string;
    title: string;
    place: string;
    prices: string[];
    location: string;
    coordenates: string[];
    description: string;
    dates: string[];
    imgs: ([]);
    url: string;
    numLike : number;
    numSaves : number;
}

  

export default function CardWrapper(
    {
        name,

    }: {
        name: string;
    }
) {

    const {position, error: geoError, loading: geoLoading} = useGeolocation();
    const [nearestEventsUrl, setNearestEventsUrl] = useState<string | null>(null);
    useEffect(() => {
        if (position?.coords){
            const {latitude, longitude} = position.coords

            if(typeof latitude === 'number' && typeof longitude === 'number'){
                setNearestEventsUrl(
                    `eventos/nearest?lat=${latitude}&lon=${longitude}`
                );
            }
        } else if (geoError) {
            // Si hay error de geolocalización, no establecer URL para eventos cercanos
            setNearestEventsUrl(null);
        }
      }, [position, geoError]);
    

    const {data : upcomingEvents, loading : upcomingLoading, error : upcomingError} = useFetchEvents('eventos/upcoming_events/');
    
    const {data : musicalEvents, loading : musicalLoading, error : musicalError} = useFetchEvents('eventos/by_category?category=Música');
  
    const {data : nearestEvents, loading : nearestLoading, error : nearestError} = useFetchNearestEvents(nearestEventsUrl || "");

    const {data : sportsEvents, loading : sportsLoading, error : sportsError} = useFetchEvents('eventos/by_category?category=Deportes');

    
    const isLoading = useMemo(() => {
    return upcomingLoading || musicalLoading || nearestLoading || sportsLoading || geoLoading;
    }, [upcomingLoading, musicalLoading, nearestLoading, sportsLoading, geoLoading]);    const errors = useMemo(() => {
    // Solo incluir errores críticos, no errores de geolocalización
    return [upcomingError, musicalError, nearestError, sportsError].filter(
      (e): e is string => e !== null,
    );
    }, [upcomingError, musicalError, nearestError, sportsError]);

    
    if (isLoading && errors.length === 0) {
        return (
        <div className="flex min-h-screen justify-center items-center">
            <p>Cargando datos...</p>
        </div>
        );
    }
  
    if (errors.length > 0) {
        return (
        <div className="flex min-h-screen flex-col justify-center items-center text-red-600">
            <p>Ocurrieron uno o más errores:</p>
            <ul>
            {errors.map((errMsg, index) => (
                <li key={index}>{errMsg}</li>
            ))}
            </ul>
            {geoError && <p>Error de geolocalización: {geoError.message}</p>}
        </div>
        );
    }

    console.log("Position:" + position);

    return (
        <>        <div className=''>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-2 px-2">
                {name === "Cercanos a mí" && (
                    <>
                        {geoError ? (
                            <div className="col-span-full text-center py-8">
                                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                    <p className="font-medium">Ubicación no disponible</p>
                                    <p className="text-sm">Para ver eventos cercanos, activa la geolocalización en tu navegador.</p>
                                </div>
                            </div>
                        ) : nearestEvents.length === 0 && !nearestLoading ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-gray-500">No hay eventos cercanos disponibles</p>
                            </div>                        ) : (
                            nearestEvents.map((event, index) => (
                                <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} distance={event.distance} />
                            ))
                        )}
                    </>
                )}
                {name === "Próximos eventos" && upcomingEvents.map((event, index) => (
                    console.log(event._id),
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} />
                ))}
                {name === "Deportes" && sportsEvents.map((event, index) => (   
                    console.log(event._id), 
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} />
                ))}
                {name === "Musicales" && musicalEvents.map((event, index) => (
                    console.log(event._id),
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} />
                ))}
            </div>
        </div>
        
        </>
        
    );
}

export function Card({
    id,
    imgs, 
    title,
    numLikes,
    fecha,
    distance
    }: {
    id: string;
    imgs: string[];
    title: string;
    numLikes: number;
    fecha: string[];
    distance?:number;
    }) {


    if (!imgs) {
        imgs = ["imgIcon.jpeg"];
    }

    if (!title) {
        title = "Title 1";
    }

    if (!numLikes) {
        numLikes = 0;
    }

    console.log("Fecha: " + fecha)

    let likeString = "";
    if (numLikes >= 1000000) {
        likeString = (numLikes / 1000000).toFixed(1) + "M";
    } else if (numLikes >= 1000) {
        likeString = (numLikes / 1000).toFixed(1) + "k";
    } else {
        likeString = numLikes + "";
    }

    const distanceString = distance?.toFixed(2) + "km";



    const hoy = new Date();
    const fechaObjetivo = new Date(fecha[0]);
    hoy.setHours(0, 0, 0, 0);
    fechaObjetivo.setHours(0, 0, 0, 0);
    console.log("Hoy: " + hoy)
    console.log("FechaObjetivo: " + fechaObjetivo)
    const diferenciaMs = fechaObjetivo.getTime() - hoy.getTime();
    const dias = Math.round(diferenciaMs / (1000 * 60 * 60 * 24));

    let fechaString = "";
    if(dias < 7){
        fechaString = dias + "D"
    }
    if(dias >=7){
        fechaString = Math.round(dias / 7) + "W"
    }
    if(dias >= 30){
        fechaString = Math.round(dias / 30) + "M"
    }
    if (dias <= 0){
        fechaString = "HOY"
    }    const url = "../eventos/" + id;
    return (
        <Link to={url} className="group bg-white/90 backdrop-blur-sm rounded-2xl flex-col flex-none p-3 h-auto w-full shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
            {/* Container de imagen con efecto overlay */}
            <div className="relative rounded-xl overflow-hidden mb-3">
                <img
                    src={`${imgs[0]}`}
                    className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-110" 
                    alt={title}
                />
                {/* Overlay gradient sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge de likes floating */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg border border-white/20">
                    <HeartIcon className='h-4 w-4 text-pink-500' />
                    <span className='text-xs font-semibold text-gray-800'>{likeString}</span>
                </div>
            </div>

            {/* Content */}
            <div className="px-1">
                <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">
                    {title}
                </h2>
                
                {/* Info Row */}
                <div className='flex items-center justify-between'>
                    {distance == undefined ? (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 py-1.5">
                            <ClockIcon className='h-3.5 w-3.5 text-purple-600' />
                            <span className='text-xs font-medium text-purple-700'>{fechaString}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-3 py-1.5">
                            <MapPinIcon className='h-3.5 w-3.5 text-blue-600' />
                            <span className='text-xs font-medium text-blue-700'>{distanceString}</span>
                        </div>
                    )}
                    
                    {/* Decorative element */}
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-pulse delay-150"></div>
                        <div className="w-0.5 h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </div>
        </Link>
    );
}