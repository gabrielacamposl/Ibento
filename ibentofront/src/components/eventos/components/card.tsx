
import React, { useState, useEffect, useMemo } from "react";
import { HeartIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';

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
            else {
                setNearestEventsUrl(null);
            }
        }
      }, [position]);
    

    const {data : upcomingEvents, loading : upcomingLoading, error : upcomingError} = useFetchEvents('eventos/upcoming_events/');
    
    const {data : musicalEvents, loading : musicalLoading, error : musicalError} = useFetchEvents('eventos/by_category?category=Música');
  
    const {data : nearestEvents, loading : nearestLoading, error : nearestError} = useFetchNearestEvents(nearestEventsUrl || "");

    const {data : sportsEvents, loading : sportsLoading, error : sportsError} = useFetchEvents('eventos/by_category?category=Deportes');

    
    const isLoading = useMemo(() => {
    return upcomingLoading || musicalLoading || nearestLoading || sportsLoading || geoLoading;
    }, [upcomingLoading, musicalLoading, nearestLoading, sportsLoading, geoLoading]);

    const errors = useMemo(() => {
    return [upcomingError, musicalError, nearestError, sportsError, geoError].filter(
      (e): e is string => e !== null,
    );
    }, [upcomingError, musicalError, nearestError, sportsError, geoError]);

    
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

    console.log("Position:" + position)

    return (
        <>
        <div className=''>
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4 ">
                {name === "Cercanos a mí" && nearestEvents.map((event, index) => (
                    console.log(event.dates),
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} distance={event.distance} avatars={["/avatar1.jpg", "/avatar2.png", "/avatar3.png"]} />
                ))}
                {name === "Próximos eventos" && upcomingEvents.map((event, index) => (
                    console.log(event._id),
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} avatars={["/avatar1.jpg", "/avatar2.png", "/avatar3.png"]} />
                ))}
                {name === "Deportes" && sportsEvents.map((event, index) => (   
                    console.log(event._id), 
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} avatars={["/avatar1.jpg", "/avatar2.png", "/avatar3.png"]} />
                ))}
                {name === "Musicales" && musicalEvents.map((event, index) => (
                    console.log(event._id),
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} avatars={["/avatar1.jpg", "/avatar2.jpg", "/avatar3.jpg"]} />
                ))}
            </div>
        </div>
        
        </>
        
    );
}

export function Card({
    key,
    id,
    imgs, 
    title,
    numLikes,
    fecha,
    avatars,
    distance
    }: {
    key: string;
    id: string;
    imgs: string[];
    title: string;
    numLikes: number;
    fecha: string[];
    avatars: string[];
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

    // if(!key){
    //     key = "ECIP1-1";
    // }

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
    }

    const url = "../eventos/" + id;
    return (
        <Link to={url} className="bg-white rounded-lg flex-col flex-none p-1 h-76 w-48 drop-shadow-xl ">
            <img
            src={`${imgs[0]}`}
            className="rounded-lg object-cover w-full h-48" 
            alt={title}/>
            <div className="h-8">
                <h2 className="text-base font-medium text-black text-left my-2 truncate">{title}</h2>
            </div>
            

            <div className='flex flex-row items-center justify-center gap-4 my-4'>
                <div className='flex w-full space-x-1 items-center justify-center'>
                    <AvatarGroup>
                        <Avatar image={avatars[1]} size="normal" shape="circle" />
                        <Avatar image={avatars[1]} size="normal" shape="circle" />
                        <Avatar image={avatars[1]} size="normal" shape="circle" />
                    </AvatarGroup>
                    <HeartIcon className='h-6 w-6 text-black' />
                    <p className='text-black'>{likeString}</p>
                    {distance == undefined && (
                        <>
                        <div className="flex flex-row items-center justify-center">
                            <ClockIcon className='h-4 w-4 text-black' />
                            <p className='text-black'>{fechaString}</p>
                        </div>
                            
                        </>
                    )}
                    {distance !== undefined && (
                        <>
                        <div className="flex flex-row items-center justify-center">
                            <MapPinIcon className='h-4 w-4 text-black' />
                            <p className='text-black'>{distanceString}</p>
                        </div>
                        </>
                    )}
                </div>
            </div>   
        </Link>
        
    );
}