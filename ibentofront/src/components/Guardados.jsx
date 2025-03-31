import React, { useState } from 'react';
import "../assets/css/botones.css";
import { Link } from 'react-router-dom';

const Guardados = () => {

    const [events, setEvents] = useState([
        {
            id: 1,
            name: 'Love yourself BTS',
            date: '2023-11-01',
            description: 'Un concierto de KPOP para que Gaby se emocione.',
            image: '/bts.jpeg',
            ubication: 'Estadio Azteca',
            buscando:'Sí'
        },
        
        {
            id: 2,
            name: 'Love On Tour - Harry Styles',
            date: '2023-12-01',
            description: 'Harry Styles en su gira mundial Love On Tour, presentando su último álbum.',
            image: '/love.jpeg',
            ubication:'Palacio de los Deportes',
            buscando:'Sí'
        },
        {
            id: 3,
            name: 'Torneo de League of Legends',
            date: '2025-01-01',
            description: 'Un torneo de LOL para que Gaby se emocione.',
            image: '/lol.jpeg',
            ubication:'Bellas Artes',
            buscando:'No'
        }
    ]);

   
    

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className='miPerfil'>Mis Guardados</h1>
                </div>
                <div className="flex justify-center items-center mb-5 space-x-4">
                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </button>
                    
                    <button className="text-white flex items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    </button>


                  

                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd" />
                        </svg>

                    </button>
                </div>
                <h2 className='font-bold text-lg w-full'>Eventos a los que asistiré</h2>
               

                <div className="flex flex-col w-full ">
                <h2 className=''>Aparecer sólo a las personas que asistirán a los mismos eventos</h2>
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
                            {event.buscando === 'Sí' ? (
                                <button className="botonMatch absolute right-4 bottom-2 bg-green-500 text-white p-2 rounded fondoFavorito">
                                    Buscar Match
                                </button>
                            ) : (
                                <button className="cancelarMatch absolute right-4 bottom-2 bg-red-500 text-white p-2 rounded fondoFavorito">
                                    Cancelar Match
                                </button>
                            )}
                           
                            
                   

                                
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Guardados;
