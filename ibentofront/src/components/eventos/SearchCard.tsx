
import React from 'react';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';


export default function EventWrapper() {
    
    const events = [
        {
            id: 1,
            title: "Festival de Música Electrónica",
            imageUrl: "imgIcon.jpeg",
            date: "2025-05-15",
            location: "Parque Central, Ciudad de México",
            price: 350,
            url: "/events/1"
        },
        {
            id: 2,
            title: "Exposición de Arte Contemporáneo",
            imageUrl: "imgIcon2.jpeg",
            date: "2025-06-22",
            location: "Galería Nacional, Guadalajara",
            price: 120,
            url: "/events/2"
        },
        {
            id: 3,
            title: "Conferencia de Ingeniería Sustentable",
            imageUrl: "imgIcon3.jpeg",
            date: "2025-05-30",
            location: "Centro de Convenciones, Monterrey",
            price: 0,
            url: "/events/3"
        },
        {
            id: 4,
            title: "Torneo de Ajedrez Internacional",
            imageUrl: "imgIcon4.png",
            date: "2025-07-10",
            location: "Hotel Emperador, Cancún",
            price: 200,
            url: "/events/4"
        },
        {
            id: 5,
            title: "Feria Gastronómica Latinoamericana",
            imageUrl: "imgIcon.jpeg",
            date: "2025-08-05",
            location: "Plaza Principal, Puebla",
            price: 150,
            url: "/events/5"
        },
        {
            id: 6,
            title: "Maratón Urbano 2025",
            imageUrl: "imgIcon2.jpeg",
            date: "2025-09-18",
            location: "Circuito Reforma, Ciudad de México",
            price: 250,
            url: "/events/6"
        },
        {
            id: 7,
            title: "Festival de Cine Independiente",
            imageUrl: "imgIcon3.jpeg",
            date: "2025-10-12",
            location: "Cineteca Nacional, Ciudad de México",
            price: 180,
            url: "/events/7"
        },
        {
            id: 8,
            title: "Congreso de Tecnologías Emergentes",
            imageUrl: "imgIcon4.png",
            date: "2025-11-25T08:30:00",
            location: "Centro Tecnológico, Querétaro",
            price: 500,
            url: "/events/8"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl text-black font-bold mb-6 text-center">Próximos Eventos</h2>
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4">
                {events.map((event) => (
                    <EventCard 
                        key={event.id}
                        id={event.id}
                        imageUrl={event.imageUrl}
                        title={event.title}
                        date={event.date}
                        location={event.location}
                        price={event.price}
                        url={event.url}
                    />
                ))}
            </div>
        </div>
    );
}


export function EventCard({ id, imageUrl, title, date, location, price, url }) {

    const urls = "../eventos/" + id;
    return (
        <Link to={urls} className="bg-white rounded-lg p-1 h-auto w-full drop-shadow-xl ">
            <div className="bg-white w-full rounded-lg flex flex-row items-center">
                <img
                src={`/${imageUrl}`}
                className="rounded-lg object-cover w-40 h-40" 
                alt={title}/>
                
                <div className='flex flex-col justify-center px-6 gap-2'>
                    <p className="text-base font-bold text-black text-left">{title}</p>
                    <div className='flex flex-row space-x-2'>
                        <CalendarIcon className='text-black h-4 w-4' />
                        <p className='text-sm font-light text-black text-left'>{date}</p>
                    </div>
                    
                    <div className='flex flex-row space-x-2'>
                        <MapPinIcon className='text-black h-4 w-4' />
                        <p className='text-sm font-bold text-black text-left'>{location}</p>
                    </div>
                    
                    
                </div>
            </div>
            
        </Link>
        
    );
}
