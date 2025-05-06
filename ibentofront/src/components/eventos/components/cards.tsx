 import { HeartIcon, ClockIcon } from '@heroicons/react/24/solid';
 import React from 'react';
 import { Link } from 'react-router-dom';

interface ListEvent {
    _id: string;
    title: string;
    place: string;
    prices: [];
    location: string;
    coordenates: [];
    description: string;
    dates: [];
    imgs: [];
    url: string;
    numLike: number;
    numSaves : number;
}

function Cards({ 
    listEvents,
    name,
 }: { 
    listEvents: ListEvent[];
    name : string;
  } 
) {

    console.log("Ïmprimiendo evento 1:  " + listEvents[0])

    return (
        <div className="h-auto flex w-full flex-col justify-center box-border p-4">
            <h3 className="mb-4 text-xl font-bold text-black text-left">{name}</h3>
            {/* Contenedor con scroll horizontal */}
            <div className="w-full overflow-x-auto">   
                {/* Contenedor de tarjetas con ancho fijo para forzar el scroll */}
                <div className="flex flex-row space-x-1 w-full h-auto p-2">  
                    {listEvents.map((event, index) => (
                        console.log(index),
                        <Card key={event._id} id = {event._id} imgs={event.imgs} title={event.title} likes={event.numLike} />
                    ))}
                </div>
            </div>
        </div>
    );
  }
  
  interface CardProps {
    id : string;
    imgs: string[];
    title: string;
    key: string;
    likes: number
  }

  function Card({ id, imgs, title, key, likes }: CardProps) {
    const url = "../eventos/" + id;

    let likeString = "";
    if (likes >= 1000000) {
        likeString = (likes / 1000000).toFixed(1) + "M";
    } else if (likes >= 1000) {
        likeString = (likes / 1000).toFixed(1) + "k";
    } else {
        likeString = likes + "";
    }

    return (
        <>
        <Link to={url} className="flex flex-col flex-none p-2 h-auto w-64 drop-shadow-xl lg:w-72">
            <div className="relative bg-white w-60 rounded-xl flex flex-col flex p-1 shadow-md">
                <div className='relative w-full h-36 lg:h-48'>
                    <img 
                    src={`${imgs[0]}`} 
                    className="rounded-xl object-cover w-full h-36 lg:h-48 " 
                    alt={title} 
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
                </div>
                
                
                <div className='absolute bottom-3 left-3 flex flex-row space-x-2'>
                    <HeartIcon className='h-4 w-4 font-strong' />
                    <h2 className="text-sm font-bold">{likeString}</h2>
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
  