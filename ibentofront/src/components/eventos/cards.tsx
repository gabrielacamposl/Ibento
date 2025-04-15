 import { HeartIcon, ClockIcon } from '@heroicons/react/24/solid';
 import React from 'react';
 import { Link } from 'react-router-dom';

function Cards() {
    return (
        <div className="h-auto flex flex-col justify-center p-4 mx-10">
            <h3 className="mb-4 text-xl font-bold text-black text-left">Populares</h3>
            {/* Contenedor con scroll horizontal */}
            <div className="w-screen overflow-x-auto">   
            {/* Contenedor de tarjetas con ancho fijo para forzar el scroll */}
            <div className="flex flex-row space-x-1 items-center w-screen h-auto p-2">  
                <Card imageUrl="/imgIcon.jpeg" title="Titulo 1" id="1" />
                <Card imageUrl="/imgIcon2.jpeg" title="Titulo 2" id="2" />
                <Card imageUrl="/imgIcon3.jpeg" title="Titulo 3" id="3" />
                <Card imageUrl="/imgIcon4.png" title="Titulo 4" id="4"/>
                <Card imageUrl="/imgIcon5.jpeg" title="Titulo 5" id="5"/>
            </div>
            </div>
        </div>
    );
  }
  
  interface CardProps {
    imageUrl: string;
    title: string;
    id: string;
  }

  function Card({ imageUrl, title, id }: CardProps) {
    const url = "../eventos/" + id;
    return (
        <>
        <Link to={url} className="flex flex-col flex-none p-2 h-auto w-64 drop-shadow-xl items-center lg:w-72">
            <div className="relative bg-white w-60 rounded-xl flex flex-col flex p-1 shadow-md">
                <div className='relative w-full h-36 lg:h-48'>
                    <img 
                    src={imageUrl} 
                    className="rounded-xl object-cover w-full h-36 lg:h-48 " 
                    alt={title} 
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
                </div>
                
                
                <div className='absolute bottom-3 left-3 flex flex-row space-x-2 items-center'>
                    <HeartIcon className='h-4 w-4 font-strong' />
                    <h2 className="text-sm font-bold">1.5mil</h2>
                </div>
            </div>
            <div className="mt-2 p-2">
                <h3 className="font-medium text-black">{title}</h3>
            </div>
        </Link>
        </>
    );
  }
  
  export default Cards;
  