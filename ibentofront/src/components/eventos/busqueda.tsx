import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Search as SearchIcon, Sparkles, TrendingUp } from 'lucide-react';
import Search from "./components/Search";
import Cards from "./components/CategoryCard";
import EventWrapper from "./components/SearchCard";
import axios from 'axios';
import api from '../../api'
import { useParams } from "react-router-dom";

import { CardsSkeleton } from "../extras/skeletons";
import LoadingSpinner from './../../assets/components/LoadingSpinner';

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

  // Loading state
  if (isLoading) {
    return (
      <LoadingSpinner loadingText="Cargando búsqueda de eventos" />
    );
  }

  // Error state  
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">
        <div className="flex  flex-col items-center justify-between p-6">
          <div className="flex flex-items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
              <SearchIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Buscar
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border-b border-white/30 mt-10">
        {/* Search Bar */}
        <div className="glass-premium rounded-3xl p-8 animate-pulse">
          <Search placeholder="Buscar eventos..." />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 max-w-6xl mx-auto px-4 py-8">
        {/* Search Results */}
        <Suspense fallback={
          <div className="glass-premium rounded-3xl p-8 animate-pulse">
            <CardsSkeleton />
          </div>
        }>
          <EventWrapperWParams
            onResultCount={setEventCount}
            eventos={eventos}
          />
        </Suspense>

        {/* Default Content when no search results */}
        {eventCount === 0 && (
          <>
            {/* Categories Section */}
            <div className="glass-premium rounded-3xl p-6 mb-8 animate-scale-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Categorías Populares</h2>
              </div>
              <Cards />
            </div>

            {/* Upcoming Events Section */}
            <div className="glass-premium rounded-3xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">Próximos Eventos</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Tendencias</span>
                </div>
              </div>
              <EventWrapper eventos={eventos} />
            </div>
          </>)}
      </div>
    </div>
  );
}

export default Page;
