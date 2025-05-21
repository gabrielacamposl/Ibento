import React, { useState, useEffect, Suspense } from "react";
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useParams } from "react-router-dom";
import { useFetchEvents } from '../../hooks/usefetchEvents';
import EventWrapper from "./components/SearchCard";


const subcategories = [
    { category: "Deportes", subcategories: []}
]


function Page() {

    //Obtenemos el parametro (categoria) de la URL
    const { query } = useParams<{ query: string }>();
    console.log("Categoria:", query);

    // Obtenemos los eventos mediante el hook

    const { data: eventos, loading, error } = useFetchEvents('eventos/by_category?category=' + query)

    console.log("Eventos:", eventos[0]);

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
                <p>Error al cargar eventos: {error}</p>
            </div>
        );
    }

    const urls = "../busqueda/"

    return (
        <div className="w-full min-h-screen items-center justify-content-center flex flex-col">
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
            <div className="mt-6 p-4">
                <h3 id="titulo" className="mt-5 text-xl font-bold text-black text-left">{query}</h3>
            </div>
            <div>
                {/* Aqui van los tags con los que se filtra */}
            </div>
            <div>
                <div className="flex flex-col gap-1 items-center w-screen h-auto ">
                    <div className="w-11/12">
                        <EventWrapper eventos={eventos} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page;