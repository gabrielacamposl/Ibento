import React, { useEffect, useState } from 'react';
import "../../assets/css/botones.css";
import "../../assets/css/sombras.css";
import { useNavigate } from "react-router-dom";
import api from '../../api';
import { Divider } from 'primereact/divider';
import { Slider } from "primereact/slider";
import axios from 'axios';

const buscarMatchx = () => {
    const navigate = useNavigate();
    const [verificar, setVerificar] = useState(true);
    const [UserMatch, setUserMatch] = useState([]);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChecked, setIsChecked] = useState(true);
    const [value, setValue] = useState([18, 60]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()

    const [filters, setFilters] = useState({
        searchMode: 'global', // 'evento' o 'global'
        gender: 'Todos',
        ageRange: [18, 65],
        isLoading: false
    });

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('access');
            try {
                const response = await api.post('matches/sugerencias/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {

                    setUserMatch(response.data);
                    setData(response.data)
                    console.log('Usuarios disponibles:', response.data);

                } else {
                    console.error('Error en la respuesta:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
                setError("Error al cargar los datos.")
                setVerificar(false);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <span className="text-black loading loading-ring loading-xl"></span>
            </div>
        )
    }

    // Handle para aplicar los filtros
    const handleApplyFilters = async () => {
        try {

            const token = localStorage.getItem('access');
            // Activar estado de carga
            setFilters(prev => ({ ...prev, isLoading: true }));

            // Recopilar todos los datos del filtro
            const filterData = {
                searchMode: isChecked ? 'global' : 'evento',
                gender: document.querySelector('select').value,
                ageRange: {
                    min: value[0],
                    max: value[1]
                },
                timestamp: new Date().toISOString()
            };

            console.log('Filtros aplicados:', filterData);

            const response = await api.post('matches/sugerencias/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filterData)
            });

            if (response.status === 200) {

                setUserMatch(response.data);
                console.log('Usuarios disponibles:', response.data);

            } else {
                console.error('Error en la respuesta:', response.status);
            }
            // Actualizar estado global o context
            // setGlobalFilters(filterData);

            // Cerrar el modal
            document.getElementById('my_modal_2').close();

            toast.success('Filtros aplicados correctamente');

        } catch (error) {
            console.error('Error:', error);
            setError("Error al cargar los datos.")
        } finally {
            // Desactivar estado de carga
            setFilters(prev => ({ ...prev, isLoading: false }));
        }
    };

    //Darle Dislike a un usuario
    const handleNextUser = async (user_id) => {
        console.log(user_id);
        try {
            const token = localStorage.getItem('access');

            const response = await api.post('interaccion/', {
                "usuario_destino": user_id,
                "tipo_interaccion": "dislike"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
            console.log('Respuesta de la API:', response);
        } catch (error) {
            console.error('Error:', error);
        }
        // Actualizar el índice del usuario actual y restablecer el índice de la imagen
        setCurrentUserIndex((prevIndex) => (prevIndex + 1));
        setCurrentImageIndex(0);
    };

    //Darle Like a un usuario
    const handleMatch = async (user_id) => {

        try {
            const token = localStorage.getItem('access');

            const response = await api.post('interaccion/', {
                "usuario_destino": user_id,
                "tipo_interaccion": "like"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
            console.log(response.data)
            if (response.data?.match_id) {
                navigate(`../itsMatch/?id=${response.data.match_id}`);

            }
            console.log('Respuesta de la API:', response);
        } catch (error) {
            console.error('Error:', error);
        }


        setCurrentUserIndex((prevIndex) => (prevIndex + 1));
        setCurrentImageIndex(0);

    };

    const handdleVerificar = () => {
        setTimeout(() => navigate("../verificar"), 0);
    };

    if (currentUserIndex >= UserMatch.length) {
        return (
            <div className="text-black flex justify-center items-center min-h-screen">
                <label className="btn btn-circle swap swap-rotate fixed top-4 right-4 z-[9999]" onClick={() => document.getElementById('my_modal_2').showModal()}>
                    {/* this hidden checkbox controls the state */}
                    <input type="checkbox" />

                    {/* hamburger icon */}
                    <svg
                        className="swap-off fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 512 512">
                        <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                    </svg>

                    {/* close icon */}
                    <svg
                        className="swap-on fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 512 512">
                        <polygon
                            points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                    </svg>
                </label>
                <dialog id="my_modal_2" className="modal">
                    <div className="modal-box max-w-sm mx-auto bg-gray-50 rounded-3xl shadow-xl border-0 p-0 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Filtros</h2>
                            </div>
                            <form method="dialog">
                                <button className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6 space-y-6">
                            {/* Modo de búsqueda */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Modo de búsqueda
                                </h3>
                                <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                                    <button
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${!isChecked
                                            ? "bg-white text-gray-800 shadow-sm"
                                            : "text-gray-500"
                                            }`}
                                        onClick={() => setIsChecked(false)}
                                    >
                                        Evento
                                    </button>
                                    <button
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${isChecked
                                            ? "bg-white text-gray-800 shadow-sm"
                                            : "text-gray-500"
                                            }`}
                                        onClick={() => setIsChecked(true)}
                                    >
                                        Global
                                    </button>
                                </div>
                            </div>

                            {/* Género */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Género</h3>
                                <div className="relative">
                                    <select className="w-full bg-gray-100 border-0 rounded-xl py-3 px-4 text-gray-800 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Búsqueda de acompañante</option>
                                        <option>Hombre</option>
                                        <option>Mujer</option>
                                        <option>Otro</option>
                                        <option>Todos</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Rango de edad */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Rango de edad
                                </h3>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-1">Mínimo</p>
                                        <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
                                            <span className="text-lg font-bold text-gray-800">{value[0]}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="h-px bg-gray-200"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-1">Máximo</p>
                                        <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
                                            <span className="text-lg font-bold text-gray-800">{value[1]}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <Slider
                                        value={value}
                                        onChange={(e) => setValue(e.value)}
                                        className="w-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                                        range
                                    />
                                </div>
                            </div>

                            {/* Botón de aplicar */}
                            <button
                                onClick={handleApplyFilters}
                                disabled={filters.isLoading}
                                className="w-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {filters.isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Aplicando...
                                    </div>
                                ) : (
                                    'Aplicar filtros'
                                )}
                            </button>
                        </div>
                    </div>

                    <form method="dialog" className="modal-backdrop bg-black bg-opacity-30">
                        <button className="cursor-pointer">cerrar</button>
                    </form>
                </dialog>

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

    console.log("User:" + user)

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % user.profile_pic.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + user.profile_pic.length) % user.profile_pic.length);
    };

    return (
        <div className="flex justify-center items-center min-h-screen ">
            <label className="btn btn-circle swap swap-rotate fixed top-4 right-4 z-[9999]" onClick={() => document.getElementById('my_modal_2').showModal()}>
                {/* this hidden checkbox controls the state */}
                <input type="checkbox" />

                {/* hamburger icon */}
                <svg
                    className="swap-off fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 512 512">
                    <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                </svg>

                {/* close icon */}
                <svg
                    className="swap-on fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 512 512">
                    <polygon
                        points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                </svg>
            </label>
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box">
                    <h2 className="font-bold text-lg">Ajustes</h2>
                    <Divider />
                    <br />
                    <div className='flex flex-col'>
                        <div className='flex flex-row space-x-4 justify-center mb-5'>
                            <h3>Modo de busqueda</h3>
                            <h2
                                className={`text-xl transition-colors ${isChecked
                                    ? "text-gray-400 font-normal"
                                    : "text-blue-600 font-bold"
                                    }`}
                            >
                                Evento
                            </h2>
                            <input
                                type="checkbox"
                                checked={isChecked}
                                className="toggle"
                                onChange={() => setIsChecked(!isChecked)}
                            />
                            <h2
                                className={`text-xl transition-colors ${isChecked
                                    ? "text-blue-600 font-bold"
                                    : "text-gray-400 font-normal"
                                    }`}
                            >
                                Global
                            </h2>
                        </div>
                        <div className='flex flex-row'>
                            <h3>Genero</h3>
                            <select defaultValue="Pick a color" className="select">
                                <option disabled={true}>Busqueda de acompañante</option>
                                <option>Hombre</option>
                                <option>Mujer</option>
                                <option>Otro</option>
                                <option>Todos</option>
                            </select>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <h3>Rango de edad</h3>
                            <Slider value={value} onChange={(e) => setValue(e.value)} className="w-14rem" range />
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
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
                        <h1 className="mt-1 mb-2 text-2xl font-semibold ">{user?.nombre}, {user?.edad}</h1>

                        <div className="w-full">
                            <div className="flex flex-wrap">
                                <h2 className="mt-2">Le gustan: </h2>
                                <div className="flex flex-row flex-wrap gap-2 items-center justify-center w-full h-auto">
                                    {user?.preferencias_evento.slice(0, 3).map((pref, index) => (
                                        <h1 key={index} className="botonAsistir rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{pref}</h1>
                                    ))}
                                    {/*}
                                    {user.asistir.map((interest, index) => (
                                        <h1 key={index} className="botonAsistir rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                                    ))}
                                    */}
                                </div>
                            </div>

                            <h2 className="m-1">Tienen {user?.eventos_en_comun} eventos en común</h2>
                            <div className="flex flex-wrap">
                                {/*
                                {user.eventosComun.map((comun, index) => (
                                    <h1 key={index} className="Transparencia2 rounded-lg text-center mb-1 px-3 ml-3 mt-1 sm:w-auto negritas">{comun}</h1>
                                ))}
                                    */}
                            </div>

                            <div className="flex flex-wrap justify-center mt-3 space-x-10">
                                <button onClick={() => handleNextUser(user._id)} className="botonTransparente text-white p-2 rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10 w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <button onClick={() => handleMatch(user._id)} className="botonTransparente ml-20 text-white p-2 rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10z w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 z-1 bodyFoto" />
                    <div className="absolute inset-0 z-0">
                        <img src={user?.profile_pic[currentImageIndex] || '/profile_empty.webp'} className="w-full h-full sm:h-full object-cover z-0" alt={user?.nombre} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default buscarMatchx;
