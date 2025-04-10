
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
  const eventIdInt = parseInt(eventId || "0", 10);

    //Eventos
    const [events, setEvents] = useState([
      {
        id : 1,
        imagen_url : "https://example.com/palacio_bellas_artes.jpg",
        nombre : "Exposición Frida Kahlo en Bellas Artes",
        tags : ["Arte", "Cultura", "Exposición"],
        fecha : "2023-11-15",
        hora : "10:00",
        lugar : "Palacio de Bellas Artes",
        descripcion : "Exposición retrospectiva de la obra de Frida Kahlo con piezas nunca antes exhibidas.",
        fotos_urls : 
        [
            "https://example.com/frida1.jpg",
            "https://example.com/frida2.jpg"
        ]
      },
      {
        id : 2,
        imagen_url : "https://example.com/zocalo_concierto.jpg",
        nombre : "Concierto de la Orquesta Filarmónica en el Zócalo",
        tags : ["Música", "Concierto", "Gratis"],
        fecha : "2023-12-05",
        hora : "19:30",
        lugar : "Plaza de la Constitución (Zócalo)",
        descripcion : "Concierto gratuito de la Orquesta Filarmónica de la Ciudad de México con repertorio clásico.",
        fotos_urls : 
        [
            "https://example.com/zocalo1.jpg",
            "https://example.com/zocalo2.jpg"
        ]
    },
    
    {
      id : 3,
      imagen_url : "https://example.com/chapultepec_feria.jpg",
      nombre : "Feria del Libro en Chapultepec",
      tags : ["Literatura", "Feria", "Libros"],
      fecha : "2023-11-20",
      hora : "09:00",
      lugar : "Bosque de Chapultepec",
      descripcion : "Feria anual del libro con presentaciones de autores, talleres y descuentos en libros.",
      fotos_urls : 
      [
          "https://example.com/feria_libro1.jpg",
          "https://example.com/feria_libro2.jpg"
      ]
    },
    {
      id : 4,
      imagen_url : "https://example.com/roma_mezcal.jpg",
      nombre : "Festival del Mezcal en la Roma",
      tags : ["Gastronomía", "Mezcal", "Degustación"],
      fecha : "2023-11-25",
      hora : "12:00",
      lugar : "Plaza Río de Janeiro",
      descripcion : "Evento anual donde podrás degustar más de 50 tipos de mezcal artesanal de diferentes regiones de México.",
      fotos_urls : 
      [
          "https://example.com/mezcal1.jpg",
          "https://example.com/mezcal2.jpg"
      ]
    },
    {
      id : 5,
      imagen_url : "https://example.com/cineteca.jpg",
      nombre : "Ciclo de Cine Francés en la Cineteca",
      tags : ["Cine", "Francia", "Cultura"],
      fecha : "2023-12-01",
      hora : "16:00",
      lugar : "Cineteca Nacional",
      descripcion : "Proyección de lo mejor del cine francés contemporáneo con presentaciones especiales.",
      fotos_urls : [
          "https://example.com/cine_frances1.jpg",
          "https://example.com/cine_frances2.jpg"
      ]
    },
    {
      id : 6,
      imagen_url : "https://example.com/xochimilco.jpg",
      nombre : "Noche de Leyendas en Xochimilco",
      tags : ["Tradición", "Leyendas", "Trajinera"],
      fecha : "2023-11-18",
      hora : "20:00",
      lugar : "Embarcaderos de Xochimilco",
      descripcion : "Recorrido nocturno en trajinera con narración de leyendas mexicanas tradicionales.",
      fotos_urls : [
          "https://example.com/xochimilco1.jpg",
          "https://example.com/xochimilco2.jpg"
      ]
    },
    {
      id: 7,
      imagen_url: "https://example.com/teatro_juarez.jpg",
      nombre : "Obra de Teatro: 'El Quijote'",
      tags : ["Teatro", "Literatura", "Clásico"],
      fecha : "2023-11-22",
      hora : "18:00",
      lugar : "Teatro Juárez",
      descripcion : "Adaptación contemporánea de la obra maestra de Cervantes con producción mexicana.",
      fotos_urls : 
      [
          "https://example.com/quijote1.jpg",
          "https://example.com/quijote2.jpg"
      ]
    },
    {
      id : 8,
      imagen_url : "https://example.com/munal.jpg",
      nombre : "Noche de Museos en el MUNAL",
      tags : ["Museo", "Arte", "Noche de Museos"],
      fecha : "2023-11-29",
      hora : "19:00",
      lugar : "Museo Nacional de Arte",
      descripcion : "Visita guiada nocturna por las exposiciones permanentes del MUNAL con actividades especiales.",
      fotos_urls : 
      [
          "https://example.com/munal1.jpg",
          "https://example.com/munal2.jpg"
      ]
    },
    {
      id : 9, 
      imagen_url : "https://example.com/foro_sol.jpg",
      nombre : "Concierto de Café Tacvba",
      tags : ["Rock", "Concierto", "Música en vivo"],
      fecha : "2023-12-10",
      hora : "21:00",
      lugar : "Foro Sol",
      
      descripcion : "Concierto de la legendaria banda mexicana Café Tacvba presentando su nuevo álbum.",
      fotos_urls : 
      [
          "https://example.com/tacvba1.jpg",
          "https://example.com/tacvba2.jpg"
      ]
    },
    {
      id : 10,
      imagen_url : "https://example.com/teatro_colon.jpg",
      nombre : "Ballet Folklórico de México",
      tags : ["Ballet", "Cultura", "Tradición"],
      fecha : "2023-12-15",
      hora : "20:00",
      lugar : "Teatro Colón",
      descripcion : "Presentación del Ballet Folklórico de México con danzas tradicionales de diferentes regiones.",
      fotos_urls : 
      [
          "https://example.com/ballet1.jpg",
          "https://example.com/ballet2.jpg"
      ]
    }
  ]);

  const evento = events.find(ev => ev.id === Number(eventIdInt));

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
    fotos_urls 
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
            <img src={imagen_url} alt='Evento' className='w-full h-80 rounded-lg4' />
            <div className="flex flex-row">
              <p className='text-black text-4xl antialiased font-bold px-4 mt-2'>{nombre}</p>
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
                  <p>{descripcion}</p>
                </article>
            </div>
            
            <div className="w-full px-6 my-4">
                <p className="mb-1 text-xl font-bold text-black text-left">Ubicación</p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <article className="text-wrap text-black text-justify text-base mt-4">
                  <p>{lugar}</p>
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
  
