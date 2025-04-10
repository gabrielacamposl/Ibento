 import { HeartIcon, ClockIcon } from '@heroicons/react/24/solid';
 import React from 'react';

function Cards() {
    return (
        <div className="h-auto flex flex-col justify-center p-4 mx-10">
            <h3 className="mb-4 text-xl font-bold text-black text-left">Populares</h3>
            {/* Contenedor con scroll horizontal */}
            <div className="w-screen overflow-x-auto">   
            {/* Contenedor de tarjetas con ancho fijo para forzar el scroll */}
            <div className="flex flex-row space-x-4">
                <Card imageUrl="/imgIcon.jpeg" title="Titulo 1" />
                <Card imageUrl="/imgIcon2.jpeg" title="Titulo 2" />
                <Card imageUrl="/imgIcon3.jpeg" title="Titulo 3" />
                <Card imageUrl="/imgIcon4.png" title="Titulo 4" />
                <Card imageUrl="/imgIcon5.jpeg" title="Titulo 5" />
            </div>
            </div>
        </div>
    );
  }
  
  interface CardProps {
    imageUrl: string;
    title: string;
  }

  function Card({ imageUrl, title }: CardProps) {
    return (
        <>
        <div className="flex flex-col flex-none p-2 h-auto w-44 drop-shadow-xl items-center lg: w-72">
            <div className="relative bg-white rounded-lg flex flex-col flex p-2 shadow-md">
                <img 
                src={imageUrl} 
                className="rounded-lg object-cover w-full h-36 lg: h-48" 
                alt={title} 
                />
                <div className='absolute bottom-3 left-3 flex flex-row space-x-2 items-center'>
                    <HeartIcon className='h-6 w-6 font-strong' />
                    <h2 className="text-2xl font-bold">1.5mil</h2>
                </div>
            </div>
            <div className="mt-2 p-2">
                <h3 className="font-medium text-black">{title}</h3>
            </div>
        </div>
      
        </>
    );
  }
  
  export default Cards;
  