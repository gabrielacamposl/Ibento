import React, { useEffect, useState } from 'react';
import "../../assets/css/botones.css";
import "../../assets/css/sombras.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const buscarMatchx = () => {
    const navigate = useNavigate();
    const [verificar, setVerificar] = useState(true);
    const [UserMatch, setUserMatch] = useState([]);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNextUser = () => {
        setCurrentUserIndex((prevIndex) => (prevIndex + 1));
        setCurrentImageIndex(0);
    };

    const handleMatch = () => {
        setCurrentUserIndex((prevIndex) => (prevIndex + 1));
        setCurrentImageIndex(0);
        if (UserMatch[currentUserIndex]?.match) {
            setTimeout(() => navigate("../itsMatch"), 0);
        }
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % user.pictures.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + user.pictures.length) % user.pictures.length);
    };

    const handdleMessage = () => {
        setTimeout(() => navigate("../match"), 0);
    };

    const handdleVerificar = () => {
        setTimeout(() => navigate("../verificar"), 0);
    };

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('access');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/matches/sugerencias/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {
                    const formattedUsers = response.data.sugerencias.map(user => ({
                        name: `${user.nombre} ${user.apellido}`,
                        age: Math.floor(Math.random() * 10) + 20,
                        pictures: ["/default1.jpg", "/default2.jpg"],
                        asistir: user.preferencias_evento || [],
                        eventosComun: ['Ejemplo 1', 'Ejemplo 2'],
                        match: false,
                    }));
                    setUserMatch(formattedUsers);
                    console.log('Usuarios:', formattedUsers);
                } else {
                    console.error('Error en la respuesta:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
                setVerificar(false);
            }
        }
        fetchData();
    }, []);

    if (currentUserIndex >= UserMatch.length) {
        return (
            <div className="text-black flex justify-center items-center min-h-screen">
                <div className="w-full relative flex flex-col items-center max-w-lg w-full">
                    <div className="flex justify-center items-center mt-auto mb-auto font-bold text-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        Sin usuarios disponibles
                    </div>
                </div>
            </div>
        );
    }

    const user = UserMatch[currentUserIndex];

    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="relative flex flex-col items-center shadow-md shadow-t max-w-lg w-full ">
                <div className="relative w-full min-h-screen overflow-hidden ">
                    <div className="absolute inset-0 z-3 flex justify-between items-center ">
                        <button onClick={handlePrev} className="btnTransparente text-white p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button onClick={handleNext} className="btnTransparente text-white p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {verificar === false && (
                        <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(to_bottom,rgba(40,120,250,0.7),rgba(110,79,249,0.7),rgba(188,81,246,0.7))] backdrop-blur-md">
                            <div className="text-center text-white">
                                <h1 className="text-3xl font-bold">Aún no cuentas con tu perfil de acompañantes</h1>
                                <p className="mt-2">¡Créalo ahora!.</p>
                                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handdleVerificar}>Crear</button>
                            </div>
                        </div>
                    )}

                    <div className="absolute text-white ml-3 inset-0 z-4 right-0 top-55 transform translate-x-1 translate-y-1/2">
                        <h1 className="mt-1 mb-2 text-2xl font-semibold ">{user.name}, {user.age}</h1>

                        <div className="w-full">
                            <div className="flex flex-wrap">
                                <h2 className="mt-2">Asistirá a: </h2>
                                {user.asistir.map((interest, index) => (
                                    <h1 key={index} className="botonAsistir rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                                ))}
                            </div>

                            <h2 className="m-1">Tienen {user.eventosComun.length} eventos en común</h2>
                            <div className="flex flex-wrap">
                                {user.eventosComun.map((comun, index) => (
                                    <h1 key={index} className="Transparencia2 rounded-lg text-center mb-1 px-3 ml-3 mt-1 sm:w-auto negritas">{comun}</h1>
                                ))}
                            </div>

                            <div className="flex flex-wrap justify-center mt-3 space-x-10">
                                <button onClick={handleNextUser} className="botonTransparente text-white p-2 rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10 w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <button onClick={handleMatch} className="botonTransparente ml-20 text-white p-2 rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10z w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 z-1 bodyFoto" />
                    <div className="absolute inset-0 z-0">
                        <img src={user.pictures[currentImageIndex]} className="w-full h-full sm:h-full object-cover z-0" alt={user.name} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default buscarMatchx;
