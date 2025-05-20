import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
      ? `http://127.0.0.1:8000/api/eventos/event_by_id?eventId=${eventId}`
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
      <div className="flex min-h-screen justify-center items-center">
        <span className="text-black loading loading-ring loading-xl"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen justify-center items-center text-red-600">
        <p>Error al cargar evento: {error}</p>
      </div>
    );
  }

  if (!eventoDataFromHook) {
    // Esto podría ocurrir si eventId es null inicialmente o si la API no devuelve datos
    return (
      <div className="flex min-h-screen justify-center items-center">
        <p>No se encontró el evento o el ID no es válido.</p>
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
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/eventos/${_id}/dislike/`,
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
        const response = await axios.post(
          `http://127.0.0.1:8000/api/eventos/${_id}/like/`,
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
        const response = await axios.delete(
          `http://127.0.0.1:8000/eventos/delete_save/?eventId=${_id}`,
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
        const response = await axios.post(
          `http://127.0.0.1:8000/eventos/save/?eventId=${_id}`,
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


  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden flex items-center justify-center w-screen h-auto bg-gradient-to-b from-indigo-500 to-white">
        <Link
          to={urls} // O usa una función de navegación si es más complejo
          onClick={e => {
            e.preventDefault();
            window.history.back(); // Considera useNavigate().back() de react-router-dom v6+
          }}
          className="absolute top-4 left-4 z-20 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
          aria-label="Regresar"
        >
          <ArrowLeftIcon className="h-6 w-6 text-black" />
        </Link>
        <div className="flex flex-col items-center w-full h-full bg-white rounded-lg shadow-lg">
          <div className="relative w-full h-80">
            <img
              src={imgs.length > 0 ? `${imgs[0]}` : "placeholder.jpg"} // Placeholder si no hay imagen
              alt={title || "Evento"}
              className="w-full h-80 object-cover rounded-lg4"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-4">
              <div className="flex flex-col items-center">
                <button onClick={handleLike} className="focus:outline-none">
                  {isLiked ? (
                    <HeartSolid className="h-8 w-8 text-red-500" />
                  ) : (
                    <HeartOutline className="h-8 w-8 text-white" />
                  )}
                </button>
                <p className="text-white font-bold">{eventNumLikes}</p>
              </div>
              <div className="flex flex-col items-center">
                <button onClick={handleSave} className="focus:outline-none">
                  {isBookmarked ? (
                    <BookmarkSolid className="h-8 w-8 text-blue-500" />
                  ) : (
                    <BookmarkOutline className="h-8 w-8 text-white" />
                  )}
                </button>
                <p className="text-white font-bold">{eventNumSaves}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row w-full">
            <p
              id="titulo"
              className="text-black text-4xl antialiased font-bold px-4 mt-2"
            >
              {title || "Título no disponible"}
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
              <p className="text-black font-bold">{place || "Lugar no disponible"}</p>
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
            <p className="mb-1 text-xl font-bold text-black text-left">Fechas</p>
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
            <p className="mb-1 text-xl font-bold text-black text-left">Acerca de</p>
            <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
            <article className="text-wrap text-black text-justify text-base mt-4">
              <p>{description || "Descripción no disponible."}</p>
            </article>
          </div>
          <div className="w-full px-6 my-4">
            <p className="mb-1 text-xl font-bold text-black text-left">Ubicación</p>
            <div className="h-1 bg-purple-700 rounded-sm w-full"></div>
            <article className="text-wrap text-black text-justify text-base mt-4">
              <p>{location || "Ubicación no disponible."}</p>
            </article>
            <EventMap location={coor} />
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold w-90 h-auto rounded-full m-4">
            Buscar acompañante
          </button>
        </div>
      </div>
      <div className="hidden md:flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-indigo-500 to-white">
        {/* ... Contenido del Desktop View ... */}
        {/* Asegúrate de usar las variables desestructuradas de 'evento' aquí también */}
        <div className="flex flex-col items-center justify-center w-full max-w-6xl h-full bg-white rounded-lg shadow-lg mx-auto px-6">
          <div className="flex flex-col lg:flex-row w-full">
            <div className="flex flex-col space-y-6 items-center justify-center p-4 lg:w-2/3">
              <p className="text-black text-4xl antialiased font-bold px-4 mt-2">
                {title || "Título no disponible"}
              </p>
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
                  <MapPinIcon className="h-6 w-8 text-black" />
                  <p className="text-black font-bold">{place || "Lugar no disponible"}</p>
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
                  {classifications && classifications.map((tag, index) => (
                    <button
                      key={index}
                      className="bg-gray-50 text-black px-4 py-2 rounded-full mt-4"
                    >
                      {tag}
                    </button>
                  ))}
                  <div className="w-full hidden md:block">
                    <EventMap location={coor} />
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
