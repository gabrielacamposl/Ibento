
import React, { useState } from "react";
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';

import {useFetchEvents} from '../../hooks/usefetchEvents';


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


    const {data : upcomingEvents, loading : upcomingLoading, error : upcomingError} = useFetchEvents('http://127.0.0.1:8000/eventos/upcoming_events/');
  
    //const {data : nearestEvents, loading : nearestLoading, error : nearestError} = useFetchEvents('http://127.0.0.1:8000/eventos/nearest?lat=' + coords?.coords.latitude + '&long=' + coords?.coords.longitude);

    const {data : sportsEvents, loading : sportsLoading, error : sportsError} = useFetchEvents('http://127.0.0.1:8000/eventos/by_category?category=Deportes');

    const {data : musicalEvents, loading : musicalLoading, error : musicalError} = useFetchEvents('http://127.0.0.1:8000/eventos/by_category?category=Música');

    if (sportsLoading || musicalLoading || upcomingLoading) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <p>Cargando...</p> {/* Puedes usar un spinner o un mensaje más elaborado */}
            </div>
        );
    }
  
    if (upcomingError || sportsError || musicalError) {
        return (
            <div className="flex min-h-screen justify-center items-center text-red-600">
                <p>Error al cargar eventos: {upcomingError || sportsError || musicalError} </p>
            </div>
        );
    }
    
    console.log(name)

    return (
        <>
        <div className=''>
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4 ">
                {/* {name === "Cercanos a mí" && listEvents.map((event, index) => (
                    console.log(event.dates),
                    <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} fecha={event.dates} numLikes={event.numLike} avatars={["/avatar1.jpg", "/avatar2.png", "/avatar3.png"]} />
                ))} */}
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
    avatars
    }: {
    key: string;
    id: string;
    imgs: string[];
    title: string;
    numLikes: number;
    fecha: string[];
    avatars: string[];
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

    console.log(id)

    let likeString = "";
    if (numLikes >= 1000000) {
        likeString = (numLikes / 1000000).toFixed(1) + "M";
    } else if (numLikes >= 1000) {
        likeString = (numLikes / 1000).toFixed(1) + "k";
    } else {
        likeString = numLikes + "";
    }

    const hoy = new Date();
    const fechaObjetivo = new Date(fecha[0]);
    hoy.setHours(0, 0, 0, 0);
    fechaObjetivo.setHours(0, 0, 0, 0);
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
            src={`${imgs[0][0]}`}
            className="rounded-lg object-cover w-full h-48" 
            alt={title}/>
            <h2 className="text-base font-medium text-black text-left my-2">{title}</h2>

            <div className='flex flex-row items-center justify-center gap-4 my-4'>
                <div className='flex w-full space-x-1 items-center justify-center'>
                    <AvatarGroup>
                        <Avatar image={avatars[0]} size="large" shape="circle" />
                        <Avatar image={avatars[1]} size="large" shape="circle" />
                        <Avatar image={avatars[2]} size="large" shape="circle" />
                    </AvatarGroup>
                    <HeartIcon className='h-6 w-6 text-black' />
                    <p className='text-black'>{likeString}</p>
                    <ClockIcon className='h-6 w-6 text-black' />
                    <p className='text-black'>{fechaString}</p>
                    
                </div>
            </div>   
        </Link>
        
    );
}