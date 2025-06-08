import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

import {
  HeartIcon as HeartOutline,
  BookmarkIcon as BookmarkOutline,
} from "@heroicons/react/24/outline";

import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from "@heroicons/react/24/solid";

import { Calendar } from "primereact/calendar";
import EventMap from "./EventMap";
import Carousel from "./components/carousel";
import {
  useFetchEvents,
  enListadoGuardados,
  enFavoritos,
} from "../../hooks/usefetchEvents";

import { useFetchUserEvents } from "../../hooks/useFetchUser";
import axios from "axios";
import api from '../../api'

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

  // --- 1. LLAMADAS A HOOKS (SIEMPRE AL PRINCIPIO Y EN EL MISMO ORDEN)
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  const [eventNumLikes, setEventNumLikes] = useState(0);
  const [eventNumSaves, setEventNumSaves] = useState(0);

  // Hook para cargar datos del evento principal
  const {
    data: eventoDataFromHook,
    loading,
    error,
  } = useFetchEvents(
    eventId
      ? `eventos/event_by_id?eventId=${eventId}`
      : ""
  );

  // Efecto para scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Efecto para cargar el numero de likes y saves
  useEffect(() => {
    if (eventoDataFromHook) {
      const eventoActual = Array.isArray(eventoDataFromHook)
        ? eventoDataFromHook[0]
        : eventoDataFromHook;
      if (eventoActual) {
        setEventNumLikes(eventoActual.numLike || 0);
        setEventNumSaves(eventoActual.numSaves || 0);
      }
    }
  }, [eventoDataFromHook]);

  // Efecto para cargar el estado inicial de like/bookmark
  useEffect(() => {
    const cargarEstadoInicial = async () => {
      const accessToken = localStorage.getItem("access") ?? "";

      if (!eventId || !accessToken) {
        console.warn(
          "No se puede cargar estado inicial: falta eventId o accessToken."
        );
        return;
      }

      try {
        const respuestaGuardados = await enListadoGuardados(
          eventId,
          accessToken
        );
        console.log("Respuesta guardados:", respuestaGuardados);
        if (respuestaGuardados && typeof respuestaGuardados.status === "boolean") {
          setIsBookmarked(respuestaGuardados.status);
        }
        const respuestaFavoritos = await enFavoritos(eventId, accessToken);
        console.log("Respuesta favoritos:", respuestaFavoritos);
        if (respuestaFavoritos && typeof respuestaFavoritos.status === "boolean") {
          setIsLiked(respuestaFavoritos.status);
        }
      } catch (err) {
        console.error("Error al cargar el estado inicial de like/bookmark:", err);
      }
    };

    if (eventId) {
      cargarEstadoInicial();
    }
  }, [eventId]);
  // --- 2. MANEJO DE ESTADOS DE CARGA Y ERROR (DESPUÉS DE TODOS LOS HOOKS) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex justify-center items-center">
        <div className="glass-premium rounded-3xl p-8 text-center animate-pulse-glow">
          <div className="animate-spin-slow w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex justify-center items-center">
        <div className="glass-premium rounded-3xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:scale-105 transition-transform"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!eventoDataFromHook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex justify-center items-center">
        <div className="glass-premium rounded-3xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-600 text-2xl">📅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Evento no encontrado</h3>
          <p className="text-gray-600">No se encontró el evento o el ID no es válido.</p>
        </div>
      </div>
    );
  }

  // --- 3. LÓGICA DEL COMPONENTE Y JSX ---
  console.log("ID del evento procesado:", eventId);
  console.log("Datos del evento del hook:", eventoDataFromHook);

  const evento: ListEvent = Array.isArray(eventoDataFromHook)
    ? eventoDataFromHook[0]
    : eventoDataFromHook;

  // Si después de la asignación, evento sigue siendo undefined o null, maneja ese caso.
  if (!evento) {
    return <div className="flex min-h-screen justify-center items-center">No hay datos del evento disponibles.</div>;
  }


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
    // numLike = 0,
    // numSaves = 0,
  } = evento;


  const handleLike = async () => {
    if (!_id) {
      console.error("Error: Event ID (_id) is undefined.");
      return;
    }
    const token = localStorage.getItem("access");
    if (!token) {
      console.error("Error: User not authenticated.");
      return;
    }

    if (isLiked) {

      setEventNumLikes(eventNumLikes - 1)
      setIsLiked(false);

      try {
        const response = await api.delete(
          `eventos/${_id}/dislike/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("/Unlike exitoso");
          //setEventNumLikes(eventNumLikes - 1)
          setIsLiked(false);
        } else {
          setEventNumLikes(eventNumLikes + 1)
          setIsLiked(true);
          console.log("Error en like/unlike:", response);
        }
      } catch (err) {
        setEventNumLikes(eventNumLikes + 1)
        setIsLiked(true);
        console.error("Error en like/unlike:", err);
      }

    }
    else {
      setEventNumLikes(eventNumLikes + 1)
      setIsLiked(true);

      try {
        const response = await api.post(
          `eventos/${_id}/like/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("Like/Unlike exitoso");
          //setEventNumLikes(eventNumLikes + 1)
          setIsLiked(true);
        } else {
          setEventNumLikes(eventNumLikes - 1)
          setIsLiked(false); // Revertir en caso de error
          console.log("Error en like/unlike:", response);
        }
      } catch (err) {
        setEventNumLikes(eventNumLikes - 1)
        setIsLiked(false); // Revertir en caso de error
        console.error("Error en like/unlike:", err);
      }

    }
  };


  const handleSave = async () => {
    if (!_id) {
      console.error("Error: Event ID (_id) is undefined.");
      return;
    }
    const token = localStorage.getItem("access");
    if (!token) {
      console.error("Error: User not authenticated.");
      return;
    }

    if (isBookmarked) {

      setEventNumSaves(eventNumSaves - 1)
      setIsBookmarked(false);

      try {
        const response = await api.delete(
          `eventos/delete_save/?eventId=${_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("Delete exitoso");
          //setEventNumSaves(eventNumSaves - 1)
          setIsBookmarked(false);
        } else {
          setEventNumSaves(eventNumSaves + 1)
          setIsBookmarked(true);
          console.log("Error en save/unsave:", response);
        }
      } catch (err) {
        setEventNumSaves(eventNumSaves + 1)
        setIsBookmarked(true);
        console.error("Error en save/unsave:", err);
      }

    }
    else {

      setEventNumSaves(eventNumSaves + 1)
      setIsBookmarked(true);

      try {
        const response = await api.post(
          `eventos/save/?eventId=${_id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("Save exitoso");
          //setEventNumSaves(eventNumSaves + 1)
          setIsBookmarked(true);
        } else {
          setEventNumSaves(eventNumSaves - 1)
          setIsBookmarked(false);
          console.log("Error en save/unsave:", response);
        }
      } catch (err) {
        setEventNumSaves(eventNumSaves - 1)
        setIsBookmarked(false);
        console.error("Error en save/unsave:", err);
      }

    }


  };



  // Lógica para formatear likes y saves (sin cambios)
  let likeString = eventNumLikes >= 1000000 ? (eventNumLikes / 1000000).toFixed(1) + "M" : eventNumLikes >= 1000 ? (eventNumLikes / 1000).toFixed(1) + "k" : eventNumLikes + "";
  let saveString = eventNumSaves >= 1000000 ? (eventNumSaves / 1000000).toFixed(1) + "M" : eventNumSaves >= 1000 ? (eventNumSaves / 1000).toFixed(1) + "k" : eventNumSaves.toString();

  let dateString = dates.length > 0 ? dates[0].toString().split("T")[0] : "N/A";
  let timeString = dates.length > 0 ? dates[0].toString().split("T")[1]?.split(".")[0] : "N/A";

  const datesToMark: Date[] = dates.map(d => new Date(d));

  const dateTemplate = (dateInfo: any) => {
    if (datesToMark.some(markedDate =>
      markedDate.getFullYear() === dateInfo.year &&
      markedDate.getMonth() === dateInfo.month &&
      markedDate.getDate() === dateInfo.day
    )) {
      return (
        <div className="text-white bg-purple-700 rounded-full text-center" style={{ width: '2em', height: '2em', lineHeight: '2em' }}>
          {dateInfo.day}
        </div>
      );
    }
    return dateInfo.day;
  };

  const urls = "../busqueda/"; // Considera usar useNavigate para la navegación programática

  const coor = {
    lat: coordenates.length > 0 ? coordenates[0] : "0", // Proporcionar valor por defecto
    lng: coordenates.length > 1 ? coordenates[1] : "0", // Proporcionar valor por defecto
  };

  const cleanedUrl = url ? url.replace(/^\[?'|'\]?$/g, "") : "#";



  const buscarMatch = async () => {

    const token = localStorage.getItem('access');
    try {
      const response = await api.post(`usuarios/agregar_eventos_match/?idEvent=${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate(`../perfil?buscar=ok`); // Redirigir al match creado

    } catch (error) {
      console.error("Error al crear el match:", error);
    }
  }


  interface FormatDateOptions {
    year: 'numeric' | '2-digit';
    month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    day: 'numeric' | '2-digit';
  }

  function formatDate(dateString: string): string {
    const options: FormatDateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date: Date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  }

  // Formatear la hora
  function formatTime(timeString: string): string {
    if (/^\d{2}:\d{2}(:\d{2})?(Z)?$/.test(timeString)) {
      const [hour, minute] = timeString.split(':');
      let hourNum = parseInt(hour, 10);
      let ampm = hourNum >= 12 ? 'AM' : 'PM';
      
      if (hourNum === 0) hourNum = 12;
      else if (hourNum > 12) hourNum = hourNum - 12;
      return `${hourNum}:${minute} ${ampm}`;
    }
   
    const date: Date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('es-ES', options);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Back Button */}
      <div className="sticky top-0 z-50 p-4">
        <Link
          to={urls}
          onClick={e => {
            e.preventDefault();
            window.history.back();
          }}
          className="inline-flex items-center justify-center w-12 h-12 glass-premium rounded-2xl hover:scale-110 transition-all duration-300 group"
          aria-label="Regresar"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
        </Link>
      </div>      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Hero Image Section */}
        <div className="relative mb-8 animate-scale-in">
          <div className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden glass-premium">
            <img
              src={imgs.length > 0 ? `${imgs[0]}` : "placeholder.jpg"}
              alt={title || "Evento"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            {/* Action Buttons */}
            <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-4">
              <div className="flex flex-col items-center">
                <button onClick={handleLike} className="focus:outline-none">
                  {isLiked ? (
                    <HeartSolid className="h-8 w-8 text-red-500" />
                  ) : (
                    <HeartOutline className="h-8 w-8 text-white" />
                  )}
                </button>
                <p className="text-white font-bold">{likeString}</p>
              </div>
              <div className="flex flex-col items-center">
                <button onClick={handleSave} className="focus:outline-none">
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
        </div>        {/* Event Title Section */}
        <div className="glass-premium rounded-3xl p-6 mb-6 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
            {title || "Título no disponible"}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {classifications && classifications.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 glass-premium rounded-2xl text-sm font-medium text-purple-700 hover:scale-105 transition-transform duration-200"
              >
                {tag}
              </span>
            ))}
          </div>          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 glass rounded-2xl">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Fecha</p>
                <p className="text-gray-800 font-semibold">{dateString}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 glass rounded-2xl">
              <ClockIcon className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Hora</p>
                <p className="text-gray-800 font-semibold">{formatTime(timeString)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 glass rounded-2xl">
              <MapPinIcon className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Lugar</p>
                <p className="text-gray-800 font-semibold line-clamp-1">{place || "Lugar no disponible"}</p>
              </div>
            </div>
          </div>          {/* Event Link */}
          <div className="mt-6 p-4 glass rounded-2xl">
            <div className="flex items-center space-x-3">
              <LinkIcon className="h-5 w-5 text-blue-600" />
              <a
                href={cleanedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
              >
                Página oficial del evento
              </a>
            </div>
          </div>
        </div>        {/* Calendar Section */}
        <div className="glass-premium rounded-3xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Fechas disponibles</h2>
          </div>

          <div className="glass rounded-2xl p-4 overflow-hidden">
            <Calendar
              className="w-full"
              value={date}
              onChange={(e) => setDate(e.value || null)}
              inline
              dateTemplate={dateTemplate}
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="glass-premium rounded-3xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Acerca del evento</h2>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed text-justify">
              {description || "Descripción no disponible."}
            </p>
          </div>
        </div>        {/* Location Section */}
        <div className="glass-premium rounded-3xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Ubicación</h2>
          </div>

          <div className="glass rounded-2xl p-6 mb-4">
            <p className="text-gray-700 leading-relaxed mb-4">
              {location || "Ubicación no disponible."}
            </p>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <EventMap location={coor} />
          </div>
        </div>

        {/* Action Button */}
        <div className="glass-premium rounded-3xl p-6 text-center animate-slide-up mb-15">
          <button
            onClick={async () => {
              await handleSave();
              await buscarMatch();
            }}
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span>Buscar acompañante</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
