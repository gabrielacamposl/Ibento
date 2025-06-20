import React, { use, useEffect, useState, useRef } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { Toast } from "primereact/toast";
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import Favoritos from './Favoritos'; // Asegúrate de que la ruta sea correcta
import Guardados from './Guardados'; // Asegúrate de que la ruta sea correcta
import SideBar from '../usuario/sidebar'; // Asegúrate de que la ruta sea correcta

import LoadingSpinner from './../../assets/components/LoadingSpinner';
import offlineUtils, { ConnectionStatus, useOfflineRequest } from '../../utils/offlineUtils.jsx';

import axios from 'axios';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
const Perfil = () => {
    const toast = useRef(null);
    const navigate = useNavigate();
    const { makeRequest } = useOfflineRequest();    
    const [favoritos, setFavoritos] = useState([]);
    const [saveEvents, setSaveEvents] = useState([]);
    const [userPerfil, setUserPerfil] = useState({});
    const [verificar, setVerificar] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [loading, setLoading] = useState(true);


    // Detectar cambios en conexión
    useEffect(() => {
        const handleConnectionChange = (event) => {
            setIsOffline(!event.detail.isOnline);
        };

        window.addEventListener('connectionChange', handleConnectionChange);

        return () => {
            window.removeEventListener('connectionChange', handleConnectionChange);
        };
    }, []);    
    
    useEffect(() => {
        const Perfil = async () => {
            try {
                const token = localStorage.getItem('access');
                
                if (!token) {
                    console.error("No se encontró token de autenticación");
                    setLoading(false);
                    return;
                }

                const result = await makeRequest(
                    `${api.defaults.baseURL}usuarios/info_to_edit/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    },
                    'user-profile'
                );

                if (result.data) {
                    setUserPerfil(result.data);
                    console.log("Perfil obtenido:", result.data);
                    if (result.offline) {
                        console.log('Perfil cargado desde cache offline');
                    }
                } else {
                    console.error("Error al obtener perfil");
                }
            } catch (error) {
                console.error("Error al obtener perfil:", error);
            } finally {
                setLoading(false);
            }
        };
        Perfil();
    }, []);  
    
    useEffect(() => {
        const token = localStorage.getItem('access');
        const fetchVerify = async () => {
            try {
                if (!token) {
                    console.error("No se encontró token para eventos guardados");
                    return;
                }

                const response = await api.get("usuarios/obtener_eventos_guardados/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    setSaveEvents(response.data["Eventos guardados"]);
                    console.log("Guardados", response.data["Eventos guardados"]);
                }
            } catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
            }
        }
        fetchVerify();
    }, []);



    //Manejo del toast al momento de agregar un evento 
    const showSuccess = () => {
        if (toast.current) {
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Operación realizada correctamente'
            });
        }
    };

    useEffect(() => {
        //Obtener el queryParameter "verificar" de la URL
        const queryParams = new URLSearchParams(window.location.search);
        const verificarParam = queryParams.get('buscar');
        if (verificarParam === 'ok') {
            setIndex(1);
            showSuccess("¡Ahora puedes buscar matches de este evento!");

        }

    }, []);    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                const token = localStorage.getItem('access');
                
                if (!token) {
                    console.error("No se encontró token para favoritos");
                    return;
                }

                const response = await api.get('perfil/favoritos/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response);
                if (response.status === 200) {
                    const favoritosData = response.data.map((favorito) => ({
                        _id: favorito._id,
                        title: favorito.title,
                        description: favorito.description,
                        place: favorito.place,
                        dates: favorito.dates,
                        imgs: favorito.imgs,
                        isFavorite: true
                    }));
                    setFavoritos(favoritosData);
                    console.log("Favoritos obtenidos:", response.data);
                } else {
                    console.error("Error al obtener favoritos");
                }
            } catch (error) {
                console.error("Error al obtener favoritos:", error);
            }
        };
        fetchFavoritos();
    }, []);

    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    const handleTabChange = (newIndex) => {
        setIndex(newIndex);
    }
    const [index, setIndex] = React.useState(0);

    const handleFaceVerification = () => {
        setTimeout(() => navigate("../verificar-rostro"), 0);
    };

    const handleVerificar = () => {
        if (!userPerfil.is_ine_validated) {
            setTimeout(() => navigate("../verificar-ine"), 0);
        }
        else if (userPerfil.birthday === null) {
            setTimeout(() => navigate("../descripcion"), 0);
        }
        else if (userPerfil.profile_pic?.length === 0) {
            setTimeout(() => navigate("../subirFotos"), 0);

        }
        else if (!userPerfil.preferencias_generales?.length > 0) {
            setTimeout(() => navigate("../intereses"), 0);
        }
    };

    const productTemplate = (product) => {
        return (
            <div className='relative w-full h-64'>
                <img src={product} alt="Fotos" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
        );    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-50">
                <LoadingSpinner
                    logoSrc="/ibento_logo.png"
                    loadingText="Cargando perfil"
                />
            </div>
        );
    }


    //Convertir la fecha de cumpleaños AAAA-MM-DD a edad
    const calculateAge = (birthday) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }; return (
        <div className="min-h-screen bg-white">
            <div className="max-w-lg mx-auto bg-white shadow-lg">                {/* Header con carrusel de fotos */}
                <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-b-3xl overflow-visible">
                    <div className="w-full h-full overflow-hidden rounded-b-3xl">
                        <Carousel
                            value={userPerfil?.profile_pic?.length > 0 ? userPerfil.profile_pic : ['/icons/ibento.png']}
                            numVisible={1} numScroll={1} responsiveOptions={responsiveOptions}
                            className="custom-carousel rounded-b-3xl w-full h-full" circular
                            autoplayInterval={3000} itemTemplate={productTemplate} showNavigators={false}
                        />
                    </div>

                    {/* Foto de perfil flotante */}
                    <div className="absolute bottom-[-4rem] left-1/2 transform -translate-x-1/2 z-20">
                        <div className="relative">
                            <img
                                src={
                                    Array.isArray(userPerfil?.profile_pic) && userPerfil.profile_pic.length > 0 ? userPerfil.profile_pic[0] : '/profile_empty.webp'}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                                alt={userPerfil?.nombre || 'Default Profile'}
                            />
                            <Link
                                to="../editarPerfil"
                                className="absolute bottom-2 right-2 bg-gradient-to-br from-purple-400 to-blue-500 text-white p-2 rounded-full hover:scale-110 transition-all duration-300 shadow-lg z-30"
                                title="Editar perfil"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                    />
                                </svg>
                            </Link>
                        </div>                    </div>
                    <div className="lg:hidden">
                        <SideBar />
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="px-6 pt-20 pb-6">
                    {/* Nombre y edad */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2"> 
                            {userPerfil.nombre + " " + userPerfil.apellido}
                        </h1>                        {(userPerfil.is_ine_validated === true && userPerfil.is_validated_camera === false && userPerfil.birthday != null && userPerfil.profile_pic.length > 0 && userPerfil.preferencias_generales?.length) && (

                        <div className="mb-6">
                            <div className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-lg overflow-hidden">
                                {/* Elementos decorativos de fondo */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-xl"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 rounded-full blur-xl"></div>
                                
                                {/* Icono principal */}
                                <div className="relative flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Contenido principal */}
                                <div className="relative text-center">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                                        ¡Casi listo!
                                    </h3>
                                    <p className="text-gray-700 font-medium mb-2">
                                        Termina de verificar tu perfil
                                    </p>
                                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                        Verifica tu rostro para obtener tu badge de verificación y acceder a todas las funciones premium
                                    </p>
                                    
                                    {/* Botón mejorado */}
                                    <button 
                                        className="relative bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group overflow-hidden"
                                        onClick={handleFaceVerification}
                                    >
                                        {/* Efecto de brillo */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <span className="relative flex items-center justify-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121 8.25z" />
                                            </svg>
                                            <span>Finalizar verificación</span>
                                        </span>
                                    </button>
                                </div>

                                {/* Indicador de progreso */}
                                <div className="relative mt-6">
                                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>INE verificada</span>
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Perfil completo</span>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                        <span>Verificación facial</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}
                        <div className="flex items-center justify-center space-x-3 text-gray-600">
                            <div className="flex items-center space-x-1">
                                {userPerfil.gender !== "" && userPerfil.gender && (
                                    <>
                                        {userPerfil.gender === 'H' || userPerfil.gender === 'Hombre' ? (
                                            <i className="pi pi-mars" style={{ color: '#8b5cf6' }}></i>
                                        ) : (
                                            <i className="pi pi-venus" style={{ color: '#ec4899' }}></i>
                                        )}
                                        <span className="text-lg font-medium">{calculateAge(userPerfil.birthday)} años</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {userPerfil.birthday === null && (
                            <>
                                <div className="flex items-center justify-center space-x-2 text-gray-500 mt-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                    </svg>
                                    <span className="text-sm">{userPerfil.birthday}</span>
                                </div>
                            </>
                        )}

                    </div>

                    {/* Preferencias de eventos */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-purple-500 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                            </svg>
                            Preferencias de eventos
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {userPerfil.preferencias_evento && userPerfil.preferencias_evento.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-light border border-purple-200"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>                    {(userPerfil.is_ine_validated === false || userPerfil.birthday === null || userPerfil.profile_pic?.length === 0 || !userPerfil.preferencias_generales?.length > 0) && (

                        <div className="mb-6">
                            <div className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-lg overflow-hidden">
                                {/* Elementos decorativos de fondo */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-xl"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 rounded-full blur-xl"></div>

                                {/* Icono principal */}
                                <div className="relative flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Contenido principal */}
                                <div className="relative text-center">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                                        ¡Bienvenido a Ibento!
                                    </h3>
                                    <p className="text-gray-700 font-medium mb-2">
                                        Crear cuenta de matches
                                    </p>
                                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                        Completa tu perfil para acceder a todas las funciones y comenzar a conectar con personas increíbles
                                    </p>
                                    
                                    {/* Botón mejorado */}
                                    <button 
                                        className="relative bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group overflow-hidden"
                                        onClick={handleVerificar}
                                    >
                                        {/* Efecto de brillo */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <span className="relative flex items-center justify-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            <span>Crear perfil</span>
                                        </span>
                                    </button>
                                </div>

                                {/* Lista de pasos pendientes */}
                                <div className="relative mt-6">
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        <div className={`flex items-center space-x-2 ${userPerfil.is_ine_validated ? 'text-green-600' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${userPerfil.is_ine_validated ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                            <span>Verificar INE</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${userPerfil.birthday ? 'text-green-600' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${userPerfil.birthday ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                            <span>Información básica</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${userPerfil.profile_pic?.length > 0 ? 'text-green-600' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${userPerfil.profile_pic?.length > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                            <span>Fotos de perfil</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${userPerfil.preferencias_generales?.length > 0 ? 'text-green-600' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${userPerfil.preferencias_generales?.length > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                            <span>Intereses</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}{/* Sobre mí */}
                    {userPerfil.description !== null && userPerfil.description && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-blue-500 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                Sobre mí
                            </h2>
                            <p className="text-gray-600 text-justify leading-relaxed pl-7">
                                {userPerfil.description}
                            </p>
                        </div>
                    )}

                    {/* Tabs - Favoritos y Guardados */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex justify-center mb-6 bg-white rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => handleTabChange(0)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${index === 0
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-purple-600'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                <span className="font-medium">Favoritos</span>
                            </button>
                            <button
                                onClick={() => handleTabChange(1)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${index === 1
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-purple-600'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                                </svg>
                                <span className="font-medium">Guardados</span>
                            </button>
                        </div>

                        {/* Contenido de tabs */}
                        <div>
                            {index === 0 ? (
                                <Favoritos events={favoritos} />
                            ) : (
                                <Guardados events={saveEvents} verify={verificar} />
                            )}
                        </div>                    </div>
                </div>
            </div>
            {/* Toast component for notifications */}
            <Toast ref={toast} />
            {/* Indicador de estado de conexión */}
            <ConnectionStatus />

            {/* Indicador offline en la parte superior derecha si hay datos offline */}
            {isOffline && (
                <div className="fixed top-4 right-4 z-40 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Modo Offline</span>
                </div>
            )}
        </div>

    );
};
export default Perfil;