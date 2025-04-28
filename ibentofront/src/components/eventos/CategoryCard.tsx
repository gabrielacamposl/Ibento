import { HeartIcon, ClockIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { imageUrl: "/musica.jpg", title: "Conciertos", id: "1" },
  { imageUrl: "/deportes.jpg", title: "Deportes", id: "2" },
  { imageUrl: "/teatro.jpg", title: "Artes y teatro", id: "3" },
  { imageUrl: "/Familia.jpg", title: "Familia", id: "4" },
];


function Cards() {
  return (
   <div className="flex flex-row flex-wrap items-center justify-center gap-1">
   {categories.map((category) => (
    <Card
      key={category.id}
      imageUrl={category.imageUrl}
      title={category.title}
      id={category.id}
    />
   ))}
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
                <Link to={url} className="flex flex-row flex-none p-2 h-auto w-40 drop-shadow-xl items-center lg:w-72">
                   <div className="relative bg-white w-full rounded-xl flex flex-row flex p-1 shadow-md">
                       <div className='relative w-full h-full lg:h-48'>
                           <img 
                           src={imageUrl} 
                           className="rounded-xl object-cover w-full h-40 lg:h-48 " 
                           alt={title} 
                           />
                           <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-white text-center font-bold px-2 z-10 text-2xl opacity-80 hover:opacity-100 transition-opacity">
                                    {title}
                                </p>
                            </div>
                       </div>
                    </div>
                </Link>
       </>
   );
 }
 
 export default Cards;
 