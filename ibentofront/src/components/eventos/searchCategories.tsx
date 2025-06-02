import React, { useState, useEffect, Suspense } from "react";
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid'
import { useParams } from "react-router-dom";
import { useFetchEvents } from '../../hooks/usefetchEvents';
import EventWrapper from "./components/SearchCard";


function Page() {

    //Obtenemos el parametro (categoria) de la URL
    const { query } = useParams<{ query: string }>();
    console.log("Categoria:", query);    // Obtenemos los eventos mediante el hook
    const { data: eventos, loading, error } = useFetchEvents('eventos/by_category?category=' + query)

    console.log("Eventos:", eventos[0]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
                <div className="glass-premium rounded-3xl p-8 border border-white/30">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 font-medium">Cargando eventos...</p>
                    </div>
                </div>
            </div>        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
                <div className="glass-premium rounded-3xl p-8 border border-white/30 text-center">
                    <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <StarIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-red-600 font-medium">Error al cargar eventos: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>            {/* Header Premium */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0">
                <div className="flex items-center justify-between p-4 md:p-6">
                    <Link
                        to="../busqueda/"
                        onClick={e => {
                            e.preventDefault();
                            window.history.back();
                        }}
                        className="p-2 md:p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        aria-label="Regresar"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                    </Link>
                    
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 justify-center max-w-md">
                        <div className="p-1.5 md:p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                            <StarIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                                {query}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-600">
                                {eventos.length} evento{eventos.length !== 1 ? 's' : ''} encontrado{eventos.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="w-10 md:w-12"></div> {/* Spacer for balance */}
                </div>
            </div>            {/* Contenido Principal */}
            <div className="relative z-10 flex-1 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    {eventos.length > 0 ? (
                        <div className="space-y-4 md:space-y-6">
                            
                            {/* Grid de eventos */}
                            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/30 shadow-lg">
                                <EventWrapper eventos={eventos} />
                            </div>
                        </div>
                    ) : (
                        /* Estado vacío */
                        <div className="glass-premium rounded-3xl p-12 border border-white/30 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <StarIcon className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                No hay eventos disponibles
                            </h3>
                            <p className="text-gray-600 text-lg">
                                No encontramos eventos en la categoría "{query}" en este momento.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page;