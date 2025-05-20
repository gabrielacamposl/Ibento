import React, { useState } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import api from '../../api';
const Favoritos = ({ events }) => {
    const [favoritosCheck, setFavoritosCheck] = useState(true);

    function formartDate(dateString) {
        const date = dateString.slice(0, 10);
        const dateFormarted = date.split('-').reverse().join('/');
        return dateFormarted;
    }

    const handleRemoveFavorite = async (eventId) => {
        if (!eventId) {
            console.error('Invalid eventId:', eventId);
            alert('Error: Invalid event ID');
            return;
        }

        const token = localStorage.getItem("access");
        try {
            const response = await api.post(`favoritos/${eventId}/eliminar/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                console.log('Evento eliminado de favoritos:', eventId);
               
            } else {
                alert('Error al eliminar el evento de favoritos: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el evento de favoritos');
        }
    };



    return (
        <div className="text-black ">
            <div className="relative flex flex-col items-center   max-w-lg w-full">
                <div className="flex flex-col w-full ">
                    {events.map(event => (
                        <div key={event._id} className="flex items-center mb-3 p-2 rounded-lg Caja relative">
                            {event.imgs && event.imgs[0] && (
                                <img src={event.imgs[0]} className="w-20 h-20  object-cover mr-4" alt={event.title} />
                            )}
                            <div className="flex flex-col">
                                <h2 className="text-xl font-semibold">{event.title}</h2>
                                {event.dates && event.dates[0] && (
                                    <p>{formartDate(event.dates[0])}</p>
                                )}
                                <p>{event.place}</p>
                            </div>
                            <button 
                                className="absolute right-4 bottom-2  bg-gray-800 text-white p-2 rounded-full fondoFavorito"
                                onClick={() => handleRemoveFavorite(event._id)}
                            >
                                {favoritosCheck == true ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                </svg>) : (
                                
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Favoritos;
