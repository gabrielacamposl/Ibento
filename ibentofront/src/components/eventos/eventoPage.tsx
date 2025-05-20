
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClockIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Calendar } from 'primereact/calendar';
import EventMap from './EventMap';
import Carousel from './components/carousel';
import { useFetchEvents, enListadoGuardados, enFavoritos} from "../../hooks/usefetchEvents";
import { useFetchUserEvents } from "../../hooks/useFetchUser";

import api from "../../api"

import { useParams } from 'react-router-dom';

//Easter Egg: Porfavorya

interface ListEvent {
  _id: string;
  title: string;
  place: string;
  price: string[];
  location: string;
  coordenates: string[];
  classifications: string[];
  description: string;
  dates: string[];
  imgs: string[];
  url: string;
  numLike: number;
  numSaves: number;
}

function Page() {

  const { eventId } = useParams<{ eventId: string }>();
  console.log("ID del evento:", eventId);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  const { data: evento, loading, error } = useFetchEvents("eventos/event_by_id?eventId=" +  eventId);

  const eventoEnGuardados = enListadoGuardados(eventId ?? "", localStorage.getItem("access") ?? "")
  const eventoEnFavorios = enFavoritos(eventId ?? "", localStorage.getItem("access") ?? "")


  //const { data: eventosUsuario, loading: loadingUsuario, error: errorUsuario } = useFetchUserEvents(localStorage.getItem("access") ?? "");

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <span className="text-black loading loading-ring loading-xl"></span>
      </div>
    );

  }
      
interface LikeResponse {
  status: number;
} 

  const Like = async (id_event: string): Promise<void> => {
    if (!id_event) {
      console.error("Error: Event ID is undefined or invalid.");
      return;
    }

    const token: string | null = localStorage.getItem("access");
    if (!token) {
      console.error("Error: User is not authenticated. Token is missing.");
      return;
    }

    try {
      console.log("Token:", token);
      console.log("ID del evento:", id_event);
      const response = await api.post(
        `eventos/${id_event}/like/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        console.log("Evento liked successfully");
        setIsLiked(true);
      } else {
        console.log("Error liking event:", response);
      }
    } catch (error) {
      console.error("Error liking event:", error);
    }
  };

  // useEffect(() => {

  //   if (eventos.length > 0 && eventId) {
  //     const foundEvent = eventos.find((ev) => ev._id === eventId);
  //     setCurrentEvent(foundEvent || null);
  //   }
  // }, [eventos, eventId]);

  if (error) {
    return (
      <div className="flex min-h-screen justify-center items-center text-red-600">
        <p>Error al cargar eventos: {error}</p>
      </div>
    );
  }

  if (!evento) return <div>No hay datos</div>;

  console.log("Evento:", evento);


  const eventData = Array.isArray(evento) ? evento[0] : evento || {};

  const {
    _id,
    title,
    place,
    price,
    location,
    coordenates = [],
    description,
    classifications = [],
    dates = [],
    imgs = [],
    url,
    numLike,
    numSaves,
  } = eventData;

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleSave = () => {
    setIsBookmarked(!isBookmarked);
  };

  let likeString = "";
  if (numLike >= 1000000) {
    likeString = (numLike / 1000000).toFixed(1) + "M";
  } else if (numLike >= 1000) {
    likeString = (numLike / 1000).toFixed(1) + "k";
  } else {
    likeString = numLike + "";
  }

  let saveString = "";
  if (numSaves >= 1000000) {
    saveString = (numSaves / 1000000).toFixed(1) + "M";
  } else if (numSaves >= 1000) {
    saveString = (numSaves / 1000).toFixed(1) + "k";
  } else {
    saveString = numSaves.toString();
  }


  let dateString = dates[0].toString().split("T")[0];
  let timeString = dates[0].toString().split("T")[1].split(".")[0];

  const datesToMark: Date[] = dates.map(dateString => new Date(dateString));

  const dateTemplate = (dateInfo: any) => {
    if (datesToMark.some(markedDate =>
      markedDate.getFullYear() === dateInfo.year &&
      markedDate.getMonth() === dateInfo.month &&
      markedDate.getDate() === dateInfo.day
    )) {
      // Si la fecha está en el array de fechas a marcar
      return (
        <div className="text-white bg-purple-700 rounded-full text-center" style={{ width: '2em', height: '2em', lineHeight: '2em' }}>

          {dateInfo.day}
        </div>
      );
    } else {
      // Para las fechas que no están en el array
      return dateInfo.day;
    }
  };

  console.log("Fecha: " + date);


  const urls = "../busqueda/"

  const coor = {
    lat: coordenates[0],
    lng: coordenates[1]
  }

  console.log("Coordenadas: " + coordenates)
  console.log("Clasificaciones: " + classifications)

  const cleanedUrl = url ? url.replace(/^\[?'|'\]?$/g, '') : '';

  const handleSave = async (eventId: string): Promise<void> => {

    //Validar que reciba una ID
    if (!eventId) {
      console.error("Error: Event ID is undefined or invalid.");
      return;
    }

    //Obtenemos token de acceso
    const token: string | null = localStorage.getItem("access");
    if (!token) {
      console.error("Error: User is not authenticated. Token is missing.");
      return;
    }

    // Revertimos el estado de guardado
    const originalIsBookmarked = isBookmarked;
    setIsBookmarked(!originalIsBookmarked);


    try {
      console.log("Token:", token);
      console.log("ID del evento:", eventId);

      const response = await api.post(
        `eventos/save/?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        console.log("Evento save successfully");
      } else {
        console.log("Error saving event:", response);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden flex items-center justify-center w-screen h-auto bg-gradient-to-b from-indigo-500 to-white">
        {/* Botón de retroceso */}
        <Link
          to={urls}
          onClick={e => {
            e.preventDefault();
            window.history.back();
          }}
          className="absolute top-4 left-4 z-20 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
          aria-label="Regresar"
        >
          <ArrowLeftIcon className="h-6 w-6 text-black" />
        </Link>
        <div className="flex flex-col items-center w-full h-full bg-white rounded-lg shadow-lg">
          {/* Imagen y botones en la esquina */}
          <div className="relative w-full h-80">
            <img
              src={`${imgs[0]}`}
              alt="Evento"
              className="w-full h-80 object-cover rounded-lg4"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
            {/* Botones en la esquina inferior derecha */}
            <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-4">


              {/* Like */}
              <div className="flex flex-col items-center">
                <button onClick={() => { toggleLike(); Like(_id); }} className="focus:outline-none">
                  {isLiked ? (
                    <HeartSolid className="h-8 w-8 text-red-500" />
                  ) : (
                    <HeartOutline className="h-8 w-8 text-white" />
                  )}
                </button>
                <p className="text-white font-bold">{likeString}</p>
              </div>



              {/* Guardado */}
              <div className="flex flex-col items-center">
                <button onClick={() => handleSave(eventId ?? '')} className="focus:outline-none">
                  {isBookmarked ? (
                    <BookmarkSolid className="h-8 w-8 text-blue-500" />
                  ) : (
                    <BookmarkOutline className="h-8 w-8 text-white" />
                  )}
                </button>
                <p className="text-white font-bold">{saveString}</p>
              </div>
            </div>
          </div>
          {/* Título */}
          <div className="flex flex-row w-full">
            <p
              id="titulo"
              className="text-black text-4xl antialiased font-bold px-4 mt-2"
            >
              {title}
            </p>
          </div>
          <div className="flex flex-row flex-wrap gap-2 items-center justify-center w-full h-auto">
            {classifications && classifications.map((tag, index) => (
              <button
                key={index}
                className="bg-gray-100 text-black px-4 py-2 rounded-full mt-4"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-row my-4 flex-wrap gap-4 items-center justify-center w-full h-auto">
            <div className="flex flex-row space-x-1 items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-black" />
              <p className="text-black font-bold">{dateString}</p>
            </div>
            <div className="flex flex-row space-x-1 items-center justify-center">
              <ClockIcon className="h-6 w-6 text-black" />
              <p className="text-black font-bold">{timeString}</p>
            </div>
            <div className="flex flex-row space-x-1 items-center justify-center">
              <MapPinIcon className="h-6 w-6 text-black" />
              <p className="text-black font-bold">{place}</p>
            </div>
          </div>
          <div className="flex flex-row space-x-3">
            <LinkIcon className="h-6 w-6 text-black" />
            <a
              href={cleanedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-bold hover:underline font-base"
            >
              Página del evento
            </a>
          </div>
          <div className="w-full px-6 my-4">
            <p
              id="titulo"
              className="mb-1 text-xl font-bold text-black text-left"
            >
              Fechas
            </p>
            <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
            <div className="my-5 card flex justify-content-center">
              <Calendar
                className="text-black"
                value={date}
                onChange={(e) => setDate(e.value || null)}
                inline
                dateTemplate={dateTemplate}
              />
            </div>
          </div>
          <div className="w-full px-6">
            <p
              id="titulo"
              className="mb-1 text-xl font-bold text-black text-left"
            >
              Acerca de
            </p>
            <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
            <article className="text-wrap text-black text-justify text-base mt-4">
              <p>{description}</p>
            </article>
          </div>

          <div className="w-full px-6 my-4">
            <p
              id="titulo"
              className="mb-1 text-xl font-bold text-black text-left"
            >
              Ubicación
            </p>
            <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
            <article className="text-wrap text-black text-justify text-base mt-4">
              <p>{location}</p>
            </article>
            <EventMap location={coor} />
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold w-90 h-auto rounded-full m-4">
            Buscar acompañante
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-indigo-500 to-white">
        <div className="flex flex-col items-center justify-center w-full max-w-6xl h-full bg-white rounded-lg shadow-lg mx-auto px-6">
          <div className="w-auto h-auto">
            <Carousel />
          </div>
          <div className="flex flex-col lg:flex-row w-full">
            <div className="flex flex-col space-y-6 items-center justify-center p-4 lg:w-2/3">
              <p className="text-black text-4xl antialiased font-bold px-4 mt-2">
                Formula 1: Gran premio de la Ciudad de México
              </p>
              <div className="flex flex-row my-4 flex-wrap gap-4 items-center justify-center w-full h-auto">
                <div className="flex flex-row space-x-1 items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-black" />
                  <p className="text-black font-bold">dom, 2 de nov, 2025</p>
                </div>
                <div className="flex flex-row space-x-1 items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-black" />
                  <p className="text-black font-bold">2:30 pm</p>
                </div>
                <div className="flex flex-row space-x-1 items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-black" />
                  <p className="text-black font-bold">
                    Autódromo Hermanos Rodriguez
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4 items-center justify-center p-4 lg:w-1/3">
              <div className="w-full px-6 my-4">
                <p className="mb-1 text-2xl font-bold text-black text-left">
                  Tags
                </p>
                <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
                <div className="flex flex-row flex-wrap gap-2 items-center justify-start w-full h-auto">
                  <button className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4">
                    Carreras
                  </button>
                  <button className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4">
                    Deportes
                  </button>
                  <button className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4">
                    F1
                  </button>
                  <button className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4">
                    Aire Libre
                  </button>
                  <button className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4">
                    Aventura
                  </button>
                  <button className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4">
                    Eventos
                  </button>
                  <div className="w-full hidden md:block"> {/* Agregar hidden md:block */}
                    <EventMap location={coordenates} />
                  </div>
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

