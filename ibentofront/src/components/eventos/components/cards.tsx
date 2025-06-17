 import { HeartIcon, ClockIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api';

interface ListEvent {
    _id: string;
    title: string;
    place: string;
    price: [];
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
        <div className="h-auto flex w-full flex-col justify-center box-border">
            {/* Contenedor con scroll horizontal */}
            <div className="w-full overflow-x-auto scrollbar-hide">   
                {/* Contenedor de tarjetas con ancho fijo para forzar el scroll */}
                <div className="flex flex-row space-x-4 w-full h-auto p-4 pb-6">  
                    {listEvents.map((event, index) => (
                        console.log(index),
                        <Card key={event._id} id={event._id} imgs={event.imgs} title={event.title} likes={event.numLike} />
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
    likes: number
  }
  function Card({ id, imgs, title, likes }: CardProps) {
    const url = "../eventos/" + id;
    const [isLiked, setIsLiked] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(likes);

    let likeString = "";
    if (currentLikes >= 1000000) {
        likeString = (currentLikes / 1000000).toFixed(1) + "M";
    } else if (currentLikes >= 1000) {
        likeString = (currentLikes / 1000).toFixed(1) + "k";
    } else {
        likeString = currentLikes + "";
    }

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to event page
        e.stopPropagation(); // Stop event bubbling
        
        if (isLiked) return; // Prevent multiple likes

        const token = localStorage.getItem("access");
        if (!token) {
            console.error("User not authenticated");
            return;
        }

        setIsLiked(true);
        setCurrentLikes(prev => prev + 1);

        try {
            const response = await api.post(`eventos/${id}/like/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200) {
                console.log("Like registrado exitosamente");
            } else {
                // Revert on error
                setIsLiked(false);
                setCurrentLikes(prev => prev - 1);
                console.error("Error al dar like:", response);
            }
        } catch (error) {
            // Revert on error
            setIsLiked(false);
            setCurrentLikes(prev => prev - 1);
            console.error("Error al dar like:", error);
        }
    };

    return (
        <Link 
            to={url} 
            className="group flex-none w-64 lg:w-72 transition-all duration-300 hover:scale-105"
        >
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                {/* Container de imagen con efectos */}
                <div className='relative w-full h-40 lg:h-52 overflow-hidden'>
                    <img 
                        src={`${imgs[0]}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt={title} 
                    />
                    
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      {/* Badge de likes floating */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-1.5 shadow-lg border border-white/20">
                        <button 
                            onClick={handleLike}
                            disabled={isLiked}
                            className={`p-1 rounded-full transition-all duration-300 transform hover:scale-110 ${
                                isLiked 
                                    ? 'bg-pink-500 text-white cursor-not-allowed' 
                                    : 'hover:bg-pink-100 active:scale-95'
                            }`}
                        >
                            <HeartIcon className={`h-4 w-4 transition-all duration-300 ${
                                isLiked ? 'text-white' : 'text-pink-500'
                            }`} />
                        </button>
                        <span className="text-sm font-semibold text-gray-800">{likeString}</span>
                    </div>
                    
                    {/* Efecto de brillo al hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-base lg:text-lg line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors duration-300">
                        {title}
                    </h3>
                    
                    {/* Decorative dots */}
                    <div className="flex items-center gap-1 mt-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-pulse delay-150"></div>
                        <div className="w-1 h-1 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
                
                {/* Bottom glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
        </Link>
    );
  }
  
  export default Cards;
  