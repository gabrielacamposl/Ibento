import React, { useState } from "react";
import { Image } from 'primereact/image';
import { Tag } from 'primereact/tag';
import { ClockIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import EventMap from './EventMap';
import Carousel from './carousel';

function Page() {
    const [date, setDate] = useState<Date | null>(null);

    // Coordenadas del Autódromo Hermanos Rodríguez
  const eventLocation = {
    lat: 19.4042,
    lng: -99.0907
  };

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };
    
    return (
        
      <div className='w-full'>
        {/* Mobile View */}
        <div className='md:hidden flex items-center justify-center w-screen h-auto bg-gradient-to-b from-indigo-500 to-white'>
          <div className='flex flex-col items-center w-full h-full bg-white rounded-lg shadow-lg'>
            <img src='img2.jpg' alt='Evento' className='w-full h-80 rounded-lg4' />
            <div className="flex flex-row">
              <p className='text-black text-4xl antialiased font-bold px-4 mt-2'>Formula 1: Gran premio de la Ciudad de México</p>
              <div className='flex flex-col space-y-6 items-center justify-center p-4'>
                <button 
                  onClick={toggleLike}
                  className='focus:outline-none'
                >
                  {isLiked ? (
                    <HeartSolid className='h-8 w-8 text-red-500' />
                  ) : (
                    <HeartOutline className='h-8 w-8 text-black' />
                  )}
                </button>
                
                <button 
                  onClick={toggleBookmark}
                  className='focus:outline-none'
                >
                  {isBookmarked ? (
                    <BookmarkSolid className='h-8 w-8 text-blue-500' />
                  ) : (
                    <BookmarkOutline className='h-8 w-8 text-black' />
                  )}
                </button>
              </div>
            </div>
            <div className='flex flex-row flex-wrap gap-2 items-center justify-center w-full h-auto'>
              <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Carreras</button>
              <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Deportes</button>
              <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>F1</button>
              <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Aire Libre</button>
              <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Aventura</button>  
              <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Eventos</button>
            </div>
            <div className='flex flex-row my-4 flex-wrap gap-4 items-center justify-center w-full h-auto'>
                <div className='flex flex-row space-x-1 items-center justify-center'>
                <CalendarIcon className='h-8 w-8 text-black' />
                <p className='text-black font-bold'>dom, 2 de nov, 2025</p>
                </div>
                <div className='flex flex-row space-x-1 items-center justify-center'>
                <ClockIcon className='h-6 w-6 text-black' />
                <p className='text-black font-bold'>2:30 pm</p>
                </div>
                <div className='flex flex-row space-x-1 items-center justify-center'>
                <MapPinIcon className='h-6 w-6 text-black' />
                <p className='text-black font-bold'>Autódromo Hermanos Rodriguez</p>
                </div>
            </div>
            <div className="w-full px-6 my-4">
                <p className="mb-1 text-xl font-bold text-black text-left">Fechas</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <div className="card flex justify-content-center">
                  <Calendar className="text-black" value={date} onChange={(e) => setDate(e.value || null)} inline showWeek />
                </div>
            </div>
            <div className="w-full px-6 my-4">
                <p className="mb-1 text-xl font-bold text-black text-left">Acerca de</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <article className="text-wrap text-black text-justify text-base mt-4">
                  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                </article>
            </div>
            
            <div className="w-full px-6 my-4">
                <p className="mb-1 text-xl font-bold text-black text-left">Ubicación</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <article className="text-wrap text-black text-justify text-base mt-4">
                  <p>Viad. Río de la Piedad S/n, Granjas México, Iztacalco, 08400 Ciudad de México, CDMX</p>
                </article>
                <EventMap location={eventLocation} />
            </div>

            <div className="w-full px-6 my-4">
                <p className="mb-1 text-xl font-bold text-black text-left">Galeria</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <div className="w-auto h-auto mt-4">
                  <Carousel />
                </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold w-90 h-auto rounded-full m-4">
              Buscar acompañante
            </button>

          </div>
        </div>
        
        {/* Desktop View */}
        <div className='hidden md:flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-indigo-500 to-white'>
  <div className='flex flex-col items-center justify-center w-full max-w-6xl h-full bg-white rounded-lg shadow-lg mx-auto px-6'>
    <div className="w-auto h-auto">
      <Carousel />
    </div>
    <div className="flex flex-col lg:flex-row w-full">
      <div className='flex flex-col space-y-6 items-center justify-center p-4 lg:w-2/3'>
        <p className='text-black text-4xl antialiased font-bold px-4 mt-2'>Formula 1: Gran premio de la Ciudad de México</p>
        <div className='flex flex-row my-4 flex-wrap gap-4 items-center justify-center w-full h-auto'>
          <div className='flex flex-row space-x-1 items-center justify-center'>
            <CalendarIcon className='h-8 w-8 text-black' />
            <p className='text-black font-bold'>dom, 2 de nov, 2025</p>
          </div>
          <div className='flex flex-row space-x-1 items-center justify-center'>
            <ClockIcon className='h-6 w-6 text-black' />
            <p className='text-black font-bold'>2:30 pm</p>
          </div>
          <div className='flex flex-row space-x-1 items-center justify-center'>
            <MapPinIcon className='h-6 w-6 text-black' />
            <p className='text-black font-bold'>Autódromo Hermanos Rodriguez</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4 items-center justify-center p-4 lg:w-1/3">
        <div className="w-full px-6 my-4">
          <p className="mb-1 text-2xl font-bold text-black text-left">Tags</p>
          <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
          <div className='flex flex-row flex-wrap gap-2 items-center justify-start w-full h-auto'>
            <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Carreras</button>
            <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Deportes</button>
            <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>F1</button>
            <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Aire Libre</button>
            <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Aventura</button>  
            <button className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'>Eventos</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>
    );
  }
  
  export default Page;
  
