import React, { useState } from 'react';
import "../assets/css/botones.css";
import { Link } from 'react-router-dom';

const Favoritos = ({ events }) => {

    return (
        <div className="text-black ">
            <div className="relative flex flex-col items-center   max-w-lg w-full">
                
                

                <div className="flex flex-col w-full ">
                    {events.map(event => (
                        <div key={event.id} className="flex items-center mb-3 p-2 rounded-lg Caja relative">
                            <img src={event.image} className="w-20 h-20  object-cover mr-4" alt={event.name} />
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
