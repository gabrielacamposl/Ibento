
import React, { useState } from "react";
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';


export default function CardWrapper(
    {
        name
    }: {
        name: string;
    }
) {

    console.log(name)

    const cercanos = [
        {
            id: "ECIP1-1",
            title: "Cercano 1: League of legends Finals",
            img: "lolicon.jpeg",
            fecha: "2025-04-27",
            numLikes: 1500,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "ECIP1-2",
            title: "Cercano 2: Morat",
            img: "moraticon.jpg",
            fecha: "2025-05-05",
            numLikes: 1000000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],

        },
        {
            id: "ECIP1-3",
            title: "Cercano 3: The Bities",
            img: "btsicon.jpg",
            fecha: "2025-06-12",
            numLikes: 10000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "ECIP1-4",
            title: "Cercano 4: Harry Styles todo precioso",
            img: "harryicon.jpg",
            fecha: "2025-04-21",
            numLikes: 250,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        }
    ];

    const proximos = [
        {
            id: "EPIP1-1",
            title: "Proximos 1: League of legends Finals",
            img: "lolicon.jpeg",
            fecha: "2025-04-27",
            numLikes: 1500,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "EPIP1-2",
            title: "Proximos 2: Morat",
            img: "moraticon.jpg",
            fecha: "2025-05-05",
            numLikes: 1000000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],

        },
        {
            id: "EPIP1-3",
            title: "Proximos 3: The Bities",
            img: "btsicon.jpg",
            fecha: "2025-06-12",
            numLikes: 10000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "EPIP1-4",
            title: "Proximos 4: Harry Styles todo precioso",
            img: "harryicon.jpg",
            fecha: "2025-04-21",
            numLikes: 250,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        }
    ];

    const culturales = [
        {
            id: "ECUIP1-1",
            title: "Culturales 1: League of legends Finals",
            img: "lolicon.jpeg",
            fecha: "2025-04-27",
            numLikes: 1500,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "ECUIP1-2",
            title: "Culturales 2: Morat",
            img: "moraticon.jpg",
            fecha: "2025-05-05",
            numLikes: 3000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],

        },
        {
            id: "ECUIP1-3",
            title: "Culturales 3: The Bities",
            img: "btsicon.jpg",
            fecha: "2025-06-12",
            numLikes: 10000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "ECUIP1-4",
            title: "Culturales 4: Harry Styles todo precioso",
            img: "harryicon.jpg",
            fecha: "2025-04-21",
            numLikes: 250,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        }
    ];

    const musicales = [
        {
            id: "EMUIP1-1",
            title: "Musicales 1: League of legends Finals",
            img: "lolicon.jpeg",
            fecha: "2025-04-27",
            numLikes: 1500,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "EMUIP1-2",
            title: "Musicales 2: Morat",
            img: "moraticon.jpg",
            fecha: "2025-05-05",
            numLikes: 3000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],

        },
        {
            id: "EMUIP1-2",
            title: "Musicales 3: The Bities",
            img: "btsicon.jpg",
            fecha: "2025-06-12",
            numLikes: 10000,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        },
        {
            id: "EMUIP1-2",
            title: "Musicales 4: Harry Styles todo precioso",
            img: "harryicon.jpg",
            fecha: "2025-04-21",
            numLikes: 250,
            avatars: ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg"],
        }
    ];

    return (
        <>
        <div className=''>
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4 ">
                {name === "Cercanos a mí" && cercanos.map((event, index) => (
                    console.log(event.id),
                    <Card key={event.id} id={event.id} img={event.img} title={event.title} fecha={event.fecha} numLikes={event.numLikes} avatars={event.avatars} />
                ))}
                {name === "Próximos eventos" && proximos.map((event, index) => (
                    console.log(event.id),
                    <Card key={event.id} id={event.id} img={event.img} title={event.title} fecha={event.fecha} numLikes={event.numLikes} avatars={event.avatars} />
                ))}
                {name === "Culturales" && culturales.map((event, index) => (   
                    console.log(event.id), 
                    <Card key={event.id} id={event.id} img={event.img} title={event.title} fecha={event.fecha} numLikes={event.numLikes} avatars={event.avatars} />
                ))}
                {name === "Musicales" && musicales.map((event, index) => (
                    console.log(event.id),
                    <Card key={event.id} id={event.id} img={event.img} title={event.title} fecha={event.fecha} numLikes={event.numLikes} avatars={event.avatars} />
                ))}
            </div>
        </div>
        
        </>
        
    );
}

export function Card({
    key,
    id,
    img, 
    title,
    numLikes,
    fecha,
    avatars
    }: {
    key: string;
    id: string;
    img: string;
    title: string;
    numLikes: number;
    fecha: string;
    avatars: string[];
    }) {


    if (!img) {
        img = "imgIcon.jpeg";
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
    const fechaObjetivo = new Date(fecha);
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

    console.log(title)
    console.log(dias);

    const url = "../eventos/" + id;
    return (
        <Link to={url} className="bg-white rounded-lg flex-col flex-none p-1 h-76 w-48 drop-shadow-xl ">
            <img
            src={`/${img}`}
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
                    <HeartIcon className='h-8 w-8 text-black' />
                    <p className='text-black'>{likeString}</p>
                    <ClockIcon className='h-6 w-6 text-black' />
                    <p className='text-black'>{fechaString}</p>
                    
                </div>
            </div>   
        </Link>
        
    );
}

export function Pictures(){

}