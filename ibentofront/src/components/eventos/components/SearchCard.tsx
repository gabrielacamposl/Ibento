
import React, { useEffect, useState } from 'react';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { Tag } from 'primereact/tag';

interface ListEvent {
    _id: string;
    title: string;
    place: string;
    price: string[];
    location: string;
    coordenates: string[];
    classifications: string[];
    description: string;
    dates: string[];
    imgs: string[];
    url: string;
    numLike: number;
    numSaves: number;
}
export default function EventWrapper({ eventos }: { eventos: ListEvent[] }) {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {eventos.map((event) => (
                    <EventCard
                        key={event._id}
                        id={event._id}
                        imageUrl={event.imgs[0]}
                        title={event.title}
                        date={event.dates}
                        location={event.location}
                        price={event.price}
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
    if (category[0] === "[") {
        const categoria = category.match(/'([^']+)'/g)?.map(p => p.replace(/'/g, ''));
        return categoria ? categoria[0] : category[0];
    }
    return category[0];
}

function CategoryFormat2(category: string): string {
    if (category[0] === "[") {
        const categoria = category.match(/'([^']+)'/g)?.map(p => p.replace(/'/g, ''));
        return categoria ? categoria[0] : category[0];
    }
    return category[1];
}

function AddressFormat(address: string): string {
    const formattedAddress = address.split(",")
    return formattedAddress[0];
}

export function EventCard({ id, imageUrl, title, date, location, price, url, Category }) {
    const urls = "../eventos/" + id;
      return (
        <Link 
            to={urls} 
            className="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
        >
            <div className="relative">
                {/* Imagen con overlay gradient */}
                <div className="relative overflow-hidden rounded-t-2xl h-40 sm:h-48">
                    <img
                        src={`${imageUrl}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        alt={title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Contenido */}
                <div className='p-3 sm:p-4 space-y-2 sm:space-y-3'>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200">
                        {title}
                    </h3>
                    
                    <div className='flex items-center space-x-2 text-gray-600'>
                        <CalendarIcon className='h-4 w-4 text-pink-500 flex-shrink-0' />
                        <p className='text-sm font-medium'>{DateFormat(date[0])}</p>
                    </div>

                    <div className='flex items-center space-x-2 text-gray-600'>
                        <MapPinIcon className='h-4 w-4 text-purple-500 flex-shrink-0' />
                        <p className='text-sm font-medium truncate'>{AddressFormat(location)}</p>
                    </div>
                    
                    {/* Categories */}
                    <div className='flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2'>
                        <span className='px-2 sm:px-3 py-1 bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-700 text-xs font-medium rounded-full border border-pink-200'>
                            {CategoryFormat(Category)}
                        </span>
                        {CategoryFormat2(Category) && CategoryFormat2(Category) !== CategoryFormat(Category) && (
                            <span className='px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 text-xs font-medium rounded-full border border-purple-200'>
                                {CategoryFormat2(Category)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
