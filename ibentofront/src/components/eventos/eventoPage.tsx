
import React, { useState } from "react";
import { ClockIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { Calendar } from 'primereact/calendar';
import EventMap from './EventMap';
import Carousel from './carousel';

import {useParams} from 'react-router-dom';

function Page() {

  //Para uso futuro
  const params = useParams();

  const { eventId } = useParams<{ eventId: string }>();
  console.log("ID del evento:", eventId);

  const events = [
    // Populares
    {
        id: "ECIP1-1",
        nombre: "Populares 1: League of legends Finals",
        imagen_url: "lolicon.jpeg",
        fecha: "2025-04-27",
        hora: "18:00",
        lugar: "Arena CDMX, Ciudad de México",
        coordenadas: { lat: 19.484119, lng: -99.147690 },
        numLikes: 1500,
        numGuardados: 347,
        tags: ["Deportes", "eSports", "Competencia"],
        descripcion: "Final mundial de League of Legends, el evento más esperado por los fanáticos de los eSports. ¡No te lo pierdas!",
        fotos: ["lolicon.jpeg", "lolicon.jpeg", "lolicon.jpeg"]
    },
    {
        id: "ECIP1-2",
        nombre: "Populares 2: Morat",
        imagen_url: "moraticon.jpg",
        fecha: "2025-05-05",
        hora: "20:00",
        lugar: "Auditorio Nacional, Ciudad de México",
        coordenadas: { lat: 19.426978, lng: -99.189560 },
        numLikes: 1000000,
        numGuardados: 8921,
        tags: ["Concierto", "Pop", "Latino"],
        descripcion: "Morat regresa a los escenarios con su gira mundial. Vive una noche llena de emociones y buena música.",
        fotos: ["moraticon.jpg", "moraticon.jpg", "moraticon.jpg"]
    },
    {
        id: "ECIP1-3",
        nombre: "Populares 3: The Bities",
        imagen_url: "btsicon.jpg",
        fecha: "2025-06-12",
        hora: "19:30",
        lugar: "Foro Sol, Ciudad de México",
        coordenadas: { lat: 19.404167, lng: -99.096944 },
        numLikes: 10000,
        numGuardados: 1573,
        tags: ["Concierto", "K-Pop", "Internacional"],
        descripcion: "The Bities, la sensación del K-Pop, llega a México para un concierto inolvidable. ¡No te quedes fuera!",
        fotos: ["btsicon.jpg", "btsicon.jpg", "btsicon.jpg"]
    },
    {
        id: "ECIP1-4",
        nombre: "Populares 4: Harry Styles todo precioso",
        imagen_url: "harryicon.jpg",
        fecha: "2025-04-21",
        hora: "21:00",
        lugar: "Palacio de los Deportes, Ciudad de México",
        coordenadas: { lat: 19.411944, lng: -99.096111 },
        numLikes: 250,
        numGuardados: 98,
        tags: ["Concierto", "Pop", "Internacional"],
        descripcion: "Harry Styles regresa a México con su gira mundial. Disfruta de sus mejores éxitos en vivo.",
        fotos: ["harryicon.jpg", "harryicon.jpg", "harryicon.jpg"]
    },

    // Próximos
    {
        id: "EPIP1-1",
        nombre: "Proximos 1: League of legends Finals",
        imagen_url: "lolicon.jpeg",
        fecha: "2025-04-27",
        hora: "18:00",
        lugar: "Arena CDMX, Ciudad de México",
        coordenadas: { lat: 19.484119, lng: -99.147690 },
        numLikes: 1500,
        numGuardados: 347,
        tags: ["Deportes", "eSports", "Competencia"],
        descripcion: "Final mundial de League of Legends, el evento más esperado por los fanáticos de los eSports. ¡No te lo pierdas!",
        fotos: ["lolicon.jpeg", "lolicon.jpeg", "lolicon.jpeg"]
    },
    {
        id: "EPIP1-2",
        nombre: "Proximos 2: Morat",
        imagen_url: "moraticon.jpg",
        fecha: "2025-05-05",
        hora: "20:00",
        lugar: "Auditorio Nacional, Ciudad de México",
        coordenadas: { lat: 19.426978, lng: -99.189560 },
        numLikes: 1000000,
        numGuardados: 8921,
        tags: ["Concierto", "Pop", "Latino"],
        descripcion: "Morat regresa a los escenarios con su gira mundial. Vive una noche llena de emociones y buena música.",
        fotos: ["moraticon.jpg", "moraticon.jpg", "moraticon.jpg"]
    },
    {
        id: "EPIP1-3",
        nombre: "Proximos 3: The Bities",
        imagen_url: "btsicon.jpg",
        fecha: "2025-06-12",
        hora: "19:30",
        lugar: "Foro Sol, Ciudad de México",
        coordenadas: { lat: 19.404167, lng: -99.096944 },
        numLikes: 10000,
        numGuardados: 1573,
        tags: ["Concierto", "K-Pop", "Internacional"],
        descripcion: "The Bities, la sensación del K-Pop, llega a México para un concierto inolvidable. ¡No te quedes fuera!",
        fotos: ["btsicon.jpg", "btsicon.jpg", "btsicon.jpg"]
    },
    {
        id: "EPIP1-4",
        nombre: "Proximos 4: Harry Styles todo precioso",
        imagen_url: "harryicon.jpg",
        fecha: "2025-04-21",
        hora: "21:00",
        lugar: "Palacio de los Deportes, Ciudad de México",
        coordenadas: { lat: 19.411944, lng: -99.096111 },
        numLikes: 250,
        numGuardados: 98,
        tags: ["Concierto", "Pop", "Internacional"],
        descripcion: "Harry Styles regresa a México con su gira mundial. Disfruta de sus mejores éxitos en vivo.",
        fotos: ["harryicon.jpg", "harryicon.jpg", "harryicon.jpg"]
    },

    // Culturales
    {
        id: "ECUIP1-1",
        nombre: "Culturales 1: League of legends Finals",
        imagen_url: "lolicon.jpeg",
        fecha: "2025-04-27",
        hora: "18:00",
        lugar: "Arena CDMX, Ciudad de México",
        coordenadas: { lat: 19.484119, lng: -99.147690 },
        numLikes: 1500,
        numGuardados: 347,
        tags: ["Deportes", "eSports", "Competencia"],
        descripcion: "Final mundial de League of Legends, el evento más esperado por los fanáticos de los eSports. ¡No te lo pierdas!",
        fotos: ["lolicon.jpeg", "lolicon.jpeg", "lolicon.jpeg"]
    },
    {
        id: "ECUIP1-2",
        nombre: "Culturales 2: Morat",
        imagen_url: "moraticon.jpg",
        fecha: "2025-05-05",
        hora: "20:00",
        lugar: "Auditorio Nacional, Ciudad de México",
        coordenadas: { lat: 19.426978, lng: -99.189560 },
        numLikes: 1000000,
        numGuardados: 8921,
        tags: ["Concierto", "Pop", "Latino"],
        descripcion: "Morat regresa a los escenarios con su gira mundial. Vive una noche llena de emociones y buena música.",
        fotos: ["moraticon.jpg", "moraticon.jpg", "moraticon.jpg"]
    },
    {
        id: "ECUIP1-3",
        nombre: "Culturales 3: The Bities",
        imagen_url: "btsicon.jpg",
        fecha: "2025-06-12",
        hora: "19:30",
        lugar: "Foro Sol, Ciudad de México",
        coordenadas: { lat: 19.404167, lng: -99.096944 },
        numLikes: 10000,
        numGuardados: 1573,
        tags: ["Concierto", "K-Pop", "Internacional"],
        descripcion: "The Bities, la sensación del K-Pop, llega a México para un concierto inolvidable. ¡No te quedes fuera!",
        fotos: ["btsicon.jpg", "btsicon.jpg", "btsicon.jpg"]
    },
    {
        id: "ECUIP1-4",
        nombre: "Culturales 4: Harry Styles todo precioso",
        imagen_url: "harryicon.jpg",
        fecha: "2025-04-21",
        hora: "21:00",
        lugar: "Palacio de los Deportes, Ciudad de México",
        coordenadas: { lat: 19.411944, lng: -99.096111 },
        numLikes: 250,
        numGuardados: 98,
        tags: ["Concierto", "Pop", "Internacional"],
        descripcion: "Harry Styles regresa a México con su gira mundial. Disfruta de sus mejores éxitos en vivo.",
        fotos: ["harryicon.jpg", "harryicon.jpg", "harryicon.jpg"]
    },

    // Musicales
    {
        id: "EMUIP1-1",
        nombre: "Musicales 1: League of legends Finals",
        imagen_url: "lolicon.jpeg",
        fecha: "2025-04-27",
        hora: "18:00",
        lugar: "Arena CDMX, Ciudad de México",
        coordenadas: { lat: 19.484119, lng: -99.147690 },
        numLikes: 1500,
        numGuardados: 347,
        tags: ["Deportes", "eSports", "Competencia"],
        descripcion: "Final mundial de League of Legends, el evento más esperado por los fanáticos de los eSports. ¡No te lo pierdas!",
        fotos: ["lolicon.jpeg", "lolicon.jpeg", "lolicon.jpeg"]
    },
    {
        id: "EMUIP1-2",
        nombre: "Musicales 2: Morat",
        imagen_url: "moraticon.jpg",
        fecha: "2025-05-05",
        hora: "20:00",
        lugar: "Auditorio Nacional, Ciudad de México",
        coordenadas: { lat: 19.426978, lng: -99.189560 },
        numLikes: 1000000,
        numGuardados: 8921,
        tags: ["Concierto", "Pop", "Latino"],
        descripcion: "Morat regresa a los escenarios con su gira mundial. Vive una noche llena de emociones y buena música.",
        fotos: ["moraticon.jpg", "moraticon.jpg", "moraticon.jpg"]
    },
    {
        id: "EMUIP1-3",
        nombre: "Musicales 3: The Bities",
        imagen_url: "btsicon.jpg",
        fecha: "2025-06-12",
        hora: "19:30",
        lugar: "Foro Sol, Ciudad de México",
        coordenadas: { lat: 19.404167, lng: -99.096944 },
        numLikes: 10000,
        numGuardados: 1573,
        tags: ["Concierto", "K-Pop", "Internacional"],
        descripcion: "The Bities, la sensación del K-Pop, llega a México para un concierto inolvidable. ¡No te quedes fuera!",
        fotos: ["btsicon.jpg", "btsicon.jpg", "btsicon.jpg"]
    },
    {
        id: "EMUIP1-4",
        nombre: "Musicales 4: Harry Styles todo precioso",
        imagen_url: "harryicon.jpg",
        fecha: "2025-04-21",
        hora: "21:00",
        lugar: "Palacio de los Deportes, Ciudad de México",
        coordenadas: { lat: 19.411944, lng: -99.096111 },
        numLikes: 250,
        numGuardados: 98,
        tags: ["Concierto", "Pop", "Internacional"],
        descripcion: "Harry Styles regresa a México con su gira mundial. Disfruta de sus mejores éxitos en vivo.",
        fotos: ["harryicon.jpg", "harryicon.jpg", "harryicon.jpg"]
    }
];

  const evento = events.find(ev => ev.id === eventId);

  // Si no se encuentra el evento
  if (!evento) {
    return <div>Evento no encontrado</div>;
  }

  const { 
    imagen_url, 
    nombre, 
    tags, 
    fecha, 
    hora, 
    lugar, 
    descripcion, 
    fotos 
  } = evento;



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
            <img src={`/${imagen_url}`} alt='Evento' className='w-full h-80 rounded-lg4' />
            <div className="flex flex-row">
              <p id="titulo" className='text-black text-4xl antialiased font-bold px-4 mt-2'>{nombre}</p>
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
              {tags.map((tag, index) => (
                <button 
                  key={index} 
                  className='bg-gray-50 text-black px-4 py-2 rounded-full mt-4'
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className='flex flex-row my-4 flex-wrap gap-4 items-center justify-center w-full h-auto'>
                <div className='flex flex-row space-x-1 items-center justify-center'>
                <CalendarIcon className='h-8 w-8 text-black' />
                <p className='text-black font-bold'>{fecha}</p>
                </div>
                <div className='flex flex-row space-x-1 items-center justify-center'>
                <ClockIcon className='h-6 w-6 text-black' />
                <p className='text-black font-bold'>{hora}</p>
                </div>
                <div className='flex flex-row space-x-1 items-center justify-center'>
                <MapPinIcon className='h-6 w-6 text-black' />
                <p className='text-black font-bold'>{lugar}</p>
                </div>
            </div>
            <div className="w-full px-6 my-4">
                <p id="titulo" className="mb-1 text-xl font-bold text-black text-left">Fechas</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <div className="card flex justify-content-center">
                  <Calendar className="text-black" value={date} onChange={(e) => setDate(e.value || null)} inline showWeek />
                </div>
            </div>
            <div className="w-full px-6 my-4">
                <p id="titulo" className="mb-1 text-xl font-bold text-black text-left">Acerca de</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <article className="text-wrap text-black text-justify text-base mt-4">
                  <p>{descripcion}</p>
                </article>
            </div>
            
            <div className="w-full px-6 my-4">
                <p id="titulo" className="mb-1 text-xl font-bold text-black text-left">Ubicación</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <article className="text-wrap text-black text-justify text-base mt-4">
                  <p>{lugar}</p>
                </article>
                <EventMap location={evento.coordenadas} />
            </div>

            <div className="w-full px-6 my-4">
                <p id="titulo" className="mb-1 text-xl font-bold text-black text-left">Galeria</p>
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
            <EventMap location={evento.coordenadas} />
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
  
