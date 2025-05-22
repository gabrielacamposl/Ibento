import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Search from "./components/Search";
import Cards from "./components/CategoryCard";
import EventWrapper from "./components/SearchCard";
import axios from 'axios';
import api from '../../api'
import { useParams } from "react-router-dom";

import { CardsSkeleton } from "../extras/skeletons";

// import EventWrapperWParams from "./SearchCard2";
const EventWrapperWParams = React.lazy(() => import('./components/SearchCard2'));

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



    const [eventCount, setEventCount] = useState<number | null>(null);
   


    const [eventos, setEventos] = useState<ListEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
  
      useEffect(() => {
          window.scrollTo(0, 0);
      }, []);
  
      useEffect(() => {
          const fetchEvents = async () => {
          try {
              const response = await api.get("eventos/");
              console.log("Eventos:", response.data);
              setEventos(response.data);
              setIsLoading(false);
          } catch (err) {
              setError("Error fetching events.");
              setIsLoading(false);
              console.error("Error:", err);
          }
          };
          fetchEvents();
      }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100flex flex-col items-center justify-center">
      {/* Mobile View */}
      <div className=" flex flex-col gap-1 items-center w-screen h-auto ">
        <div className="flex">
          <h3 id="titulo" className="mt-5 text-xl font-bold text-black text-left">Buscar</h3>
        </div>
        <div className="w-11/12">
          <Search placeholder="Buscar eventos..." />
        </div>
        <Suspense fallback={<CardsSkeleton />}>
        <EventWrapperWParams
          onResultCount={setEventCount}
          eventos={eventos}
        />
        </Suspense>
        
        {eventCount === 0 && (

        <>
          <div className="w-11/12">
            <Cards />
          </div>
          <div className="w-11/12 mt-10">
            <h2 className="text-2xl text-black font-bold mb-6 text-center">Próximos Eventos</h2>
            <EventWrapper eventos={eventos} />
          </div>
        </>
            )}
            <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Event Count: {eventCount}</p>
            </div>

      </div>

    
    </div>
  );
}

export default Page;
