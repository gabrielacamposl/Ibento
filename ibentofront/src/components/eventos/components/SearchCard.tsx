
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4">
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
        <Link to={urls} className="bg-white rounded-lg p-1 h-auto w-full drop-shadow-xl ">
            <div className="bg-white w-full rounded-lg flex flex-row items-center">

                <img
                    src={`${imageUrl}`}
                    className="rounded-lg object-cover w-40 h-40"
                    alt={title} />

                <div className='flex flex-col justify-center px-4 gap-2'>
                    <p className="text-base font-bold text-black text-left">{title}</p>
                    <div className='flex flex-row space-x-2'>
                        <CalendarIcon className='text-black h-4 w-4' />
                        <p className='text-sm font-light text-black text-left'>{DateFormat(date[0])}</p>
                    </div>

                    <div className='flex flex-row space-x-2'>
                        <MapPinIcon className='text-black h-4 w-4' />
                        <p className='text-sm font-bold text-black text-left'>{AddressFormat(location)}</p>
                    </div>
                    <div className='flex flex-row space-x-1'>
                        <button className='bg-purple-300 text-black mb-1 rounded-full w-22'>
                            {CategoryFormat(Category)}
                        </button>
                        <button className='bg-purple-300 text-black mb-1 rounded-full w-22 truncate'>
                            {CategoryFormat2(Category)}
                        </button>
                    </div>
                    
                </div>
            </div>

        </Link>

    );
}
