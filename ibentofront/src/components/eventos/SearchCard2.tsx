import React, {useMemo, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { useLocation } from "react-router-dom";
// import useFetchEvents from "../../hooks/fetchEvents";

function useQuery() {
    const { search } = useLocation();
    return new URLSearchParams(search);
}





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
  
export default function EventList({ onResultCount, eventos }: { onResultCount: (count: number) => void; eventos: ListEvent[] }) {



    const queryParams = useQuery();
    const query = queryParams.get("query") || "";
    
    // Filtrar eventos según el query y eliminar duplicados
    const filteredEvents = useMemo(() => {
      if (!query) return [];
      const lowerQuery = query.toLowerCase();

      return eventos.filter(event =>
        Object.values(event).some(value =>
          String(value).toLowerCase().includes(lowerQuery)
        )
      );
    }, [query]);


    useEffect(() => {
        onResultCount(filteredEvents.length);
    }, [filteredEvents.length, onResultCount]);
   
    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-row flex-wrap items-center justify-center py-4 gap-4">
                {filteredEvents.map((event) => (
                  
                    <EventCard
                        key={event._id}
                        id={event._id}
                        imageUrl={event.imgs[0]}
                        title={event.title}
                        date={event.dates}
                        location={event.location}

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
export function EventCard({ id, imageUrl, title, date, location}) {


    const urls = "../eventos/" + id;
    return (
        <Link to={urls} className="bg-white rounded-lg p-1 h-auto w-full drop-shadow-xl ">
            <div className="bg-white w-full rounded-lg flex flex-row">
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
                        <p className='text-sm font-bold text-black text-left'>{location}</p>
                    </div>
                    <p className='text-sm font-bold text-black text-left'>{imageUrl}</p>
                    
                </div>
            </div>
            
        </Link>
        
    );
}
