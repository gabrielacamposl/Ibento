import { HeartIcon, ClockIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { Link } from 'react-router-dom';

function Cards() {
   return (
           <div className="overflow-y-scroll">   
            {/* Contenedor de tarjetas con ancho fijo para forzar el scroll */}
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-1">  
                <Card imageUrl="/musica.jpg" title="Conciertos" id="1" />
                <Card imageUrl="/deportes.jpg" title="Deportes" id="2" />
                <Card imageUrl="/teatro.jpg" title="Artes y teatro" id="3" />
                <Card imageUrl="/Familia.jpg" title="Familia" id="4"/>
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
   const url = "../eventos/" + title;
   return (
       <>
                <Link to={url} className="flex flex-row flex-none p-2 h-auto w-48 drop-shadow-xl items-center lg:w-72">
                   <div className="relative bg-white w-full rounded-xl flex flex-row flex p-1 shadow-md">
                       <div className='relative w-full h-full lg:h-48'>
                           <img 
                           src={imageUrl} 
                           className="rounded-xl object-cover w-full h-42 lg:h-48 " 
                           alt={title} 
                           />
                           <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                                <h3 className="text-white text-center font-bold px-2 z-10 text-xl opacity-80 hover:opacity-100 transition-opacity lg:text-base">
                                    {title}
                                </h3>
                            </div>
                       </div>
                    </div>
                </Link>
       </>
   );
 }
 
 export default Cards;
 