import React, { useState } from 'react';
import "../assets/css/botones.css";
import { Link } from 'react-router-dom';

const Favoritos = () => {

    const [events, setEvents] = useState([
        {
            id: 1,
            name: 'Love yourself BTS',
            date: '2023-11-01',
            description: 'Un concierto de KPOP para que Gaby se emocione.',
            image: '/bts.jpeg',
            ubication: 'Estadio Azteca'
        },
        
        {
            id: 2,
            name: 'Love On Tour - Harry Styles',
            date: '2023-12-01',
            description: 'Harry Styles en su gira mundial Love On Tour, presentando su último álbum.',
            image: '/love.jpeg',
            ubication:'Palacio de los Deportes'
        },
        {
            id: 3,
            name: 'Torneo de League of Legends',
            date: '2025-01-01',
            description: 'Un torneo de LOL para que Gaby se emocione.',
            image: '/lol.jpeg',
            ubication:'Bellas Artes'
        }
    ]);

   
    

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className='miPerfil'>Mis Favoritos</h1>
                </div>
                <div className="flex justify-center items-center mb-5 space-x-4">
                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </button>
                    <button className="text-white flex items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                            </svg>
                    </button>
                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col w-full mt-10">
                    {events.map(event => (
                        <div key={event.id} className="flex items-center mb-3 p-2 rounded-lg Caja relative">
                            <img src={event.image} className="w-28 h-28 sm:w-30 sm:h-30 md:w-34 md:h-34 object-cover mr-4" alt={event.name} />
                            <div className="flex flex-col">
                                <h2 className="text-xl font-semibold">{event.name}</h2>
                                <p>{event.date}</p>
                                <p>{event.ubication}</p>
                            </div>
                            <button className="absolute right-4 bottom-2  bg-gray-800 text-white p-2 rounded-full fondoFavorito">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                            </svg>

                                
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Favoritos;
