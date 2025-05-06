
import React, { useEffect, useState } from 'react';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import axios from 'axios';


interface ListEvent {
    _id: string;
    title: string;
    place: string;
    cost: string[];
    location: string;
    coordenates: string[];
    classifications: string[];
    description: string;
    dates: string[];
    imgs: string[];
    url: string;
    //numLikes: number;
    //numSaves: number;
  }
export default function EventWrapper({ eventos }: { eventos: ListEvent[] }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl text-black font-bold mb-6 text-center">Próximos Eventos</h2>
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4">
                {eventos.map((event) => (
                    <EventCard 
                        key={event._id}
                        id={event._id}
                        imageUrl={event.imgs[0]}
                        title={event.title}
                        date={event.dates}
                        location={event.location}
                        price={event.cost}
                        url={event.url}
                        Category={event.classifications}
                    />
                ))}
            </div>
        </div>
    );
}
function DateFormat(date: string): string {
    const fecha: string = date.slice(0, 10).split("-").reverse().join("/");
    return fecha;
}

function CategoryFormat(category: string): string {
    if (category[0] ==="[") {
        const categoria = category.match(/'([^']+)'/g)?.map(p => p.replace(/'/g, ''));// Extrae la primera categoría
        return categoria ? categoria[0] : category[0];
    }
    return category[0];
}

function AddressFormat(address: string): string {
    const formattedAddress = address.split(",").toString()
    return formattedAddress;
}
export function EventCard({ id, imageUrl, title, date, location, price, url, Category }) {

    const urls = "../eventos/" + id;
    return (
        <Link to={urls} className="bg-white rounded-lg p-1 h-auto w-full drop-shadow-xl ">
            <div className="bg-white w-full rounded-lg flex flex-row items-center">
              
                <img
                src={`${imageUrl}`}
                className="rounded-lg object-cover w-40 h-40" 
                alt={title}/>
                
                <div className='flex flex-col justify-center px-6 gap-2'>
                    <p className="text-base font-bold text-black text-left">{title}</p>
                    <div className='flex flex-row space-x-2'>
                        <CalendarIcon className='text-black h-4 w-4' />
                        <p className='text-sm font-light text-black text-left'>{DateFormat(date[0])}</p>
                    </div>
                    
                    <div className='flex flex-row space-x-2'>
                        <MapPinIcon className='text-black h-4 w-4' />
                        <p className='text-sm font-bold text-black text-left'>{AddressFormat(location)}</p>
                    </div>
                    <div className='flex flex-row space-x-2'>
                    <p className='text-sm font-bold text-black text-left'>{CategoryFormat(Category)}</p>
                    </div>
                </div>
            </div>
            
        </Link>
        
    );
}
