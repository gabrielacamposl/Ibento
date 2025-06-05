import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search as SearchIcon, 
  Sparkles, 
  TrendingUp, 
  Filter, 
  Calendar, 
  MapPin, 
  Tag,
  X,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
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

interface SearchFilters {
  category: string;
  location: string;
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'date' | 'popularity' | 'title';
}

function Page() {

  const { eventId } = useParams<{ eventId: string }>();
  console.log("ID del evento:", eventId);

  const [eventCount, setEventCount] = useState<number | null>(null);
  const [eventos, setEventos] = useState<ListEvent[]>([]);
  const [filteredEventos, setFilteredEventos] = useState<ListEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
    // Filter states
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    dateRange: {
      start: '',
      end: ''
    },
    sortBy: 'date'
  });

  // Get unique categories and locations for filter options
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("eventos/");
        console.log("Eventos:", response.data);
        setEventos(response.data);
        setFilteredEventos(response.data);
          // Extract unique categories and locations
        const uniqueCategories = [...new Set(response.data.flatMap((event: ListEvent) => event.classifications))] as string[];
        const uniqueLocations = [...new Set(response.data.map((event: ListEvent) => event.location))] as string[];
        
        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
        setIsLoading(false);
      } catch (err) {
        setError("Error fetching events.");
        setIsLoading(false);
        console.error("Error:", err);
      }
    };
    fetchEvents();
  }, []);

  // Filter and sort events based on current filters
  useEffect(() => {
    let filtered = [...eventos];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(event => 
        event.classifications.some(cat => 
          cat.toLowerCase().includes(filters.category.toLowerCase())
        )
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(event => {
        const eventDates = event.dates.map(date => new Date(date));
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        return eventDates.some(date => {
          if (startDate && endDate) {
            return date >= startDate && date <= endDate;
          } else if (startDate) {
            return date >= startDate;
          } else if (endDate) {
            return date <= endDate;
          }
          return true;
        });
      });    }    // Sort events
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.dates[0] || '');
          const dateB = new Date(b.dates[0] || '');
          return dateA.getTime() - dateB.getTime();
        case 'popularity':
          return (b.numLike + b.numSaves) - (a.numLike + a.numSaves);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredEventos(filtered);
  }, [eventos, filters]);
  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      location: '',
      dateRange: { start: '', end: '' },
      sortBy: 'date'
    });
  };

  // Update filter
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">        <div className="flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="flex items-center space-x-3">
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
      </div>      <div className="bg-white/80 backdrop-blur-xl border-b border-white/30 mt-10">
        {/* Search Bar */}
        <div className="glass-premium rounded-3xl p-8">
          <Search placeholder="Buscar eventos..." />
            {/* Filter Toggle Section - Mobile Responsive */}
          <div className="mt-4 space-y-4">
            {/* Top Row: Filter Toggle and Results Count */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-transform w-fit"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {Object.values(filters).some(f => f !== '' && f !== 'date' && (typeof f !== 'object' || Object.values(f).some(v => v !== ''))) && (
                  <span className="bg-white/20 rounded-full px-2 py-1 text-xs">Activos</span>
                )}
              </button>
              
              {/* Results Count */}
              <span className="text-sm text-gray-600 self-start sm:self-center">
                {filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''} encontrado{filteredEventos.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Quick Category Filters */}
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              {['Música', 'Teatro', 'Deportes', 'Cine', 'Arte'].map(category => (
                <button
                  key={category}
                  onClick={() => updateFilter('category', filters.category === category ? '' : category)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    filters.category === category
                      ? 'bg-purple-500 text-white scale-105'
                      : 'bg-white/60 text-gray-700 hover:bg-purple-100 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 animate-scale-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filtros de búsqueda</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4" />
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full text-black px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none transition-colors bg-white/80"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4" />
                    Ubicación
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full text-black px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none transition-colors bg-white/80"
                  >
                    <option value="">Todas las ubicaciones</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full text-black px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none transition-colors bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full text-black px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none transition-colors bg-white/80"
                  />
                </div>              </div>

              {/* Sort Options */}
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4" />
                  Ordenar por
                </label>                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'date', label: 'Fecha' },
                    { value: 'popularity', label: 'Popularidad' },
                    { value: 'title', label: 'Nombre' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('sortBy', option.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.sortBy === option.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/60 text-gray-700 hover:bg-purple-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>      {/* Main Content */}
      <div className="pt-20 sm:pt-24 max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Search Results */}        <Suspense fallback={
          <div className="glass-premium rounded-3xl p-8 animate-pulse">
            <CardsSkeleton />
          </div>
        }>
          <EventWrapperWParams
            onResultCount={setEventCount}
            eventos={filteredEventos}
          />
        </Suspense>

        {/* Default Content when no search results */}
        {eventCount === 0 && (
          <>
            {/* Categories Section */}
            {/* <div className="glass-premium rounded-3xl p-6 mb-8 animate-scale-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Categorías Populares</h2>
              </div>
              <Cards />
            </div> */}

            {/* Upcoming Events Section */}
            <div className="glass-premium rounded-3xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">Eventos filtrados</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Tendencias</span>
                </div>
              </div>
              <EventWrapper eventos={filteredEventos} />
            </div>
          </>)}
      </div>
    </div>
  );
}

export default Page;
