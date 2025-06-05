import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Heart, X, Filter, ArrowLeft, Users, Sparkles, Settings, Globe, Calendar, WifiOff, CircleUserIcon } from 'lucide-react';
import api from '../../api';
import { Slider } from "primereact/slider";
import LoadingSpinner from './../../assets/components/LoadingSpinner';
import offlineUtils, { ConnectionStatus, useOfflineRequest } from '../../utils/offlineUtils.jsx';
import '../../assets/css/swipe-animations.css';
import '../../assets/css/botones.css';

const buscarMatchx = () => {
    const navigate = useNavigate();
    const cardRefs = useRef([]);
    const containerRef = useRef(null);
    const { makeRequest } = useOfflineRequest();

    // Estados para el swipe system premium
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [likeAnimation, setLikeAnimation] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Estados para usuarios y filtros
    const [UserMatch, setUserMatch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [isChecked, setIsChecked] = useState(true);
    const [value, setValue] = useState([18, 60]);
    const [showFilters, setShowFilters] = useState(false);
    const [removedUsers, setRemovedUsers] = useState(new Set());
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [verificar, setVerificar] = useState(undefined);

    const [filters, setFilters] = useState({
        searchMode: 'global',
        gender: 'Todos',
        ageRange: [18, 65],
        isLoading: false
    });

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

    const handleVerificar = () => { // Renamed
        setTimeout(() => navigate("../verificar"), 0);
    };

    // Verificar si el usuario está verificado
    useEffect(() => {
        const token = localStorage.getItem('access');
        const fetchUserValidationData = async () => {
            try {
                const result = await makeRequest(
                    `${api.defaults.baseURL}estado-validacion/`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    },
                    'user-validation'
                );

                if (result.data) {
                    const userData = result.data;
                    setVerificar(userData.is_ine_validated);
                } else {
                    setVerificar(false);
                }
            }
            catch (error) {
                console.error("Error al obtener datos de validación del usuario:", error);
                setVerificar(false);
            }
        };
        if (token) {
            fetchUserValidationData();
        } else {
            setVerificar(false);
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('access');
            try {
                const result = await makeRequest(
                    `${api.defaults.baseURL}matches/sugerencias/`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({})
                    },
                    'matches'
                );

                if (result.data) {
                    setUserMatch(result.data);
                    console.log('Usuarios disponibles:', result.data);
                    if (result.offline) {
                        console.log('Datos cargados desde cache offline');
                    }
                } else if (result.error) {
                    setError(result.offline ? "Sin conexión - algunos datos pueden estar desactualizados" : "Error al cargar los datos");
                    setVerificar(false);
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

    // Obtener el modo de búsqueda inicial
    useEffect(() => {
        const token = localStorage.getItem('access');
        const fetchMode = async () => {
            try {
                const response = await api.get("match/modo/buscar/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    const modo = response.data.modo;
                    if (modo === 'global') {
                        setIsChecked(true);
                    } else {
                        setIsChecked(false);
                    }
                }
            } catch (error) {
                console.error("Error al obtener el modo de búsqueda:", error);
            }
        };
        fetchMode();
    }, []);

    // Función para cambiar el modo de búsqueda
    const changeSearchMode = async (newMode) => {
        const token = localStorage.getItem('access');
        try {
            const body = { modo: newMode };
            const response = await api.post("match/modo/", body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                console.log("Modo cambiado a:", newMode);
            }
        } catch (error) {
            console.error("Error al cambiar el modo:", error);
        }
    };

    // Haptic feedback para dispositivos móviles
    const triggerHaptic = (intensity = 'light') => {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [50],
                success: [10, 50, 10]
            };
            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    };

    // Funciones premium para swipe
    const performSwipe = async (isLike) => {
        if (isAnimating || currentIndex >= UserMatch.length) return;

        setIsAnimating(true);
        setLikeAnimation(isLike ? 'like' : 'dislike');

        const card = cardRefs.current[currentIndex];
        const user = UserMatch[currentIndex];

        if (card) {
            const exitX = isLike ? window.innerWidth + 100 : -window.innerWidth - 100;
            const exitRotation = isLike ? 30 : -30;

            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = `translateX(${exitX}px) rotate(${exitRotation}deg) scale(0.8)`;
            card.style.opacity = '0';

            triggerHaptic(isLike ? 'success' : 'medium');

            // Ejecutar la acción correspondiente
            if (isLike) {
                await handleMatch(user._id);
            } else {
                await handleNextUser(user._id);
            }

            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
                setLikeAnimation(null);
                setCurrentImageIndex(0);
            }, 600);
        }
    };

    const resetCard = (card) => {
        if (card) {
            card.style.transition = 'all 0.3s ease-out';
            card.style.transform = 'translateX(0px) translateY(0px) rotate(0deg) scale(1)';
            card.style.opacity = '1';
        }
    };

    // Botones de acción premium
    const handleLikeButton = () => {
        if (currentIndex < UserMatch.length) {
            performSwipe(true);
        }
    };

    const handleDislikeButton = () => {
        if (currentIndex < UserMatch.length) {
            performSwipe(false);
        }
    };

    // Utilidades
    const hasMoreUsers = () => {
        return currentIndex < UserMatch.length;
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return `, ${age}`;
    };

    // Sistema de swipe premium - Touch handlers
    const handleTouchStart = useCallback((e) => {
        if (isAnimating) return;

        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
        setIsDragging(true);

        const card = cardRefs.current[currentIndex];
        if (card) {
            card.style.transition = 'none';
        }
    }, [currentIndex, isAnimating]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || isAnimating) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        setTouchCurrent({ x: deltaX, y: deltaY });

        const card = cardRefs.current[currentIndex];
        if (card) {
            const rotation = deltaX * 0.1;
            const scale = Math.max(0.95, 1 - Math.abs(deltaX) * 0.0005);

            card.style.transform = `translateX(${deltaX}px) translateY(${deltaY * 0.3}px) rotate(${rotation}deg) scale(${scale})`;
            card.style.opacity = Math.max(0.7, 1 - Math.abs(deltaX) * 0.002);

            // Mostrar indicadores de like/dislike (sin super like)
            if (Math.abs(deltaX) > 50) {
                setSwipeDirection(deltaX > 0 ? 'like' : 'dislike');
                triggerHaptic('light');
            } else {
                setSwipeDirection(null);
            }
        }
    }, [isDragging, touchStart, currentIndex, isAnimating]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging || isAnimating) return;

        setIsDragging(false);
        const deltaX = touchCurrent.x;

        const card = cardRefs.current[currentIndex];
        if (!card) return;

        const threshold = 120;

        if (Math.abs(deltaX) > threshold) {
            // Solo like o dislike, sin super like
            const isLike = deltaX > 0;
            performSwipe(isLike);
        } else {
            // Regresar a posición original
            resetCard(card);
        }

        setSwipeDirection(null);
        setTouchCurrent({ x: 0, y: 0 });
    }, [isDragging, touchCurrent, currentIndex, isAnimating]);

    // Soporte para mouse en desktop
    const handleMouseDown = useCallback((e) => {
        if (isAnimating) return;

        e.preventDefault();
        setTouchStart({ x: e.clientX, y: e.clientY });
        setIsDragging(true);

        const card = cardRefs.current[currentIndex];
        if (card) {
            card.style.transition = 'none';
            card.style.cursor = 'grabbing';
        }
    }, [currentIndex, isAnimating]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || isAnimating) return;

        const deltaX = e.clientX - touchStart.x;
        const deltaY = e.clientY - touchStart.y;

        setTouchCurrent({ x: deltaX, y: deltaY });

        const card = cardRefs.current[currentIndex];
        if (card) {
            const rotation = deltaX * 0.1;
            const scale = Math.max(0.95, 1 - Math.abs(deltaX) * 0.0005);

            card.style.transform = `translateX(${deltaX}px) translateY(${deltaY * 0.3}px) rotate(${rotation}deg) scale(${scale})`;
            card.style.opacity = Math.max(0.7, 1 - Math.abs(deltaX) * 0.002);

            // Indicadores de swipe
            if (Math.abs(deltaX) > 50) {
                setSwipeDirection(deltaX > 0 ? 'like' : 'dislike');
            } else {
                setSwipeDirection(null);
            }
        }
    }, [isDragging, touchStart, currentIndex, isAnimating]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging || isAnimating) return;

        setIsDragging(false);
        const deltaX = touchCurrent.x;

        const card = cardRefs.current[currentIndex];
        if (!card) return;

        card.style.cursor = 'grab';

        const threshold = 120;

        if (Math.abs(deltaX) > threshold) {
            const isLike = deltaX > 0;
            performSwipe(isLike);
        } else {
            resetCard(card);
        }

        setSwipeDirection(null);
        setTouchCurrent({ x: 0, y: 0 });
    }, [isDragging, touchCurrent, currentIndex, isAnimating]);

    // useEffect para eventos globales de mouse
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleApplyFilters = async () => {
        try {
            const token = localStorage.getItem('access');
            // Activar estado de carga
            setFilters(prev => ({ ...prev, isLoading: true }));

            // Determinar el modo de búsqueda
            const searchMode = isChecked ? 'global' : 'evento';

            // Guardar el modo de búsqueda
            await changeSearchMode(searchMode);

            // Recopilar todos los datos del filtro
            const filterData = {
                searchMode: searchMode,
                gender: document.querySelector('select').value,
                ageRange: {
                    min: value[0],
                    max: value[1]
                },
                timestamp: new Date().toISOString()
            };

            console.log('Filtros aplicados:', filterData);
            const response = await api.post('matches/sugerencias/', filterData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                setUserMatch(response.data);
                console.log('Usuarios disponibles:', response.data);
            } else {
                console.error('Error en la respuesta:', response.status);
            }
            // Cerrar el modal
            document.getElementById('my_modal_2').close();

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
    };

    const handdleVerificar = () => {
        setTimeout(() => navigate("../verificar"), 0);
    };

    const user = UserMatch[currentIndex];

    console.log("User:" + user)

    const handleNext = () => {
        if (user?.profile_pic) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % user.profile_pic.length);
        }
    };

    const handlePrev = () => {
        if (user?.profile_pic) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + user.profile_pic.length) % user.profile_pic.length);
        }
    };

    // Conditional returns after all hooks
    if (loading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 z-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (currentIndex >= UserMatch.length) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center min-h-screen">
                {/* Header premium con filtros */}
                <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">
                    <div className="flex items-center justify-between p-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/60 transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                    Descubre
                                </h1>
                                <p className="text-sm text-gray-600">Sin usuarios disponibles</p>
                            </div>
                        </div>

                        <button
                            onClick={() => document.getElementById('my_modal_2').showModal()}
                            className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/60 transition-all duration-300"
                        >
                            <Filter className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>

                {verificar == false && (
                    <div className="min-h-screen fixed inset-0 z-60 flex items-center justify-center bg-[linear-gradient(to_bottom,rgba(40,120,250,0.7),rgba(110,79,249,0.7),rgba(188,81,246,0.7))] backdrop-blur-md">
                        <div className="text-center text-white">
                            <h1 className="text-3xl font-bold">Aún no cuentas con tu perfil de acompañantes</h1>
                            <p className="mt-2">¡Créalo ahora!.</p>
                            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handdleVerificar}>Crear</button>
                        </div>
                    </div>
                )}

                <dialog id="my_modal_2" className="modal">
                    <div className="modal-box max-w-sm mx-auto glass-premium rounded-3xl shadow-2xl border border-white/30 p-0 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <Filter className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Filtros Premium</h2>
                            </div>
                            <form method="dialog">
                                <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30">
                                    <X className="w-5 h-5 text-gray-700" />
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
                                <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option>Todos</option>
                                    <option>Masculino</option>
                                    <option>Femenino</option>
                                </select>
                            </div>

                            {/* Rango de edad */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Rango de edad: {value[0]} - {value[1]} años
                                </h3>
                                <div className="px-2">
                                    <Slider
                                        min={18}
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

                <div className="w-full relative flex flex-col items-center max-w-lg lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
                    <div className="flex justify-center items-center mt-auto mb-auto font-bold text-2xl">
                        <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Users className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        ¡Todo listo!
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-sm text-center">
                        Sin usuarios disponibles por el momento. Ajusta tus filtros o vuelve más tarde.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        Recargar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            {/* Header premium */}
            <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">
                <div className="flex items-center justify-between p-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/60 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                Descubre
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => document.getElementById('my_modal_2').showModal()}
                        className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/60 transition-all duration-300"
                    >
                        <Filter className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>

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
                                    min={18}
                                    value={value}
                                    onChange={(e) => setValue(e.value)}
                                    className="w-full p-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
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

            {/* Card Stack Container */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-32 pb-40">
                <div
                    ref={containerRef}
                    className="relative w-full max-w-sm mx-auto"
                    style={{ height: '600px' }}
                >
                    {hasMoreUsers() ? (
                        <>
                            {/* Stack de tarjetas premium */}
                            {UserMatch.slice(currentIndex, currentIndex + 3).map((user, stackIndex) => {
                                const actualIndex = currentIndex + stackIndex;
                                const zIndex = 3 - stackIndex;
                                const scale = 1 - stackIndex * 0.05;
                                const translateY = stackIndex * 8;

                                return (
                                    <div
                                        key={user._id || actualIndex}
                                        ref={el => cardRefs.current[actualIndex] = el}
                                        className={`absolute inset-0 glass-premium rounded-3xl overflow-hidden shadow-2xl border border-white/30 ${stackIndex === 0 ? 'cursor-grab active:cursor-grabbing' : ''
                                            }`}
                                        style={{
                                            zIndex,
                                            transform: `scale(${scale}) translateY(${translateY}px)`,
                                            transition: stackIndex === 0 ? 'none' : 'all 0.3s ease'
                                        }}
                                        onTouchStart={stackIndex === 0 ? handleTouchStart : undefined}
                                        onTouchMove={stackIndex === 0 ? handleTouchMove : undefined}
                                        onTouchEnd={stackIndex === 0 ? handleTouchEnd : undefined}
                                        onMouseDown={stackIndex === 0 ? handleMouseDown : undefined}
                                        onMouseMove={stackIndex === 0 ? (e) => isDragging && handleMouseMove(e) : undefined}
                                        onMouseUp={stackIndex === 0 ? handleMouseUp : undefined}
                                    >
                                        {/* Imagen de perfil */}
                                        <div className="relative h-full">
                                            <img
                                                src={user?.profile_pic?.[currentImageIndex] || '/profile_empty.webp'}
                                                alt={user?.nombre || 'Usuario'}
                                                className="w-full h-full object-cover"
                                                draggable={false}
                                            />

                                            {/* Overlay gradiente más sutil */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

                                            {/* Botones de navegación de imagen (solo en la primera tarjeta) */}
                                            {stackIndex === 0 && user?.profile_pic?.length > 1 && (
                                                <div className="absolute inset-0 z-10 flex justify-between items-center px-4">
                                                    <button
                                                        onClick={handlePrev}
                                                        className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all duration-300"
                                                    >
                                                        <ArrowLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={handleNext}
                                                        className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all duration-300"
                                                    >
                                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Indicadores de swipe */}
                                            {stackIndex === 0 && swipeDirection && (
                                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${swipeDirection === 'like'
                                                    ? 'bg-green-500/20'
                                                    : 'bg-red-500/20'
                                                    }`}>
                                                    <div className={`p-6 rounded-full border-4 ${swipeDirection === 'like'
                                                        ? 'border-green-400 bg-green-400/20'
                                                        : 'border-red-400 bg-red-400/20'
                                                        } animate-pulse`}>
                                                        {swipeDirection === 'like' ? (
                                                            <Heart className="w-16 h-16 text-green-400 fill-current" />
                                                        ) : (
                                                            <X className="w-16 h-16 text-red-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Indicadores de imagen */}
                                            {stackIndex === 0 && user?.profile_pic?.length > 1 && (
                                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                                    {user.profile_pic.map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Información del usuario - SIN DISTANCIA NI PUNTO VERDE */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent text-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h2 className="text-2xl font-bold">
                                                        {user?.nombre}{user?.edad ? `, ${user.edad}` : (user?.fecha_nacimiento ? calculateAge(user.fecha_nacimiento) : '')}
                                                    </h2>
                                                </div>
                                                <button
                                                    onClick={() => navigate('../verLike')}
                                                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
                                                >
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </button>
                                            </div>

                                            {/* Preferencias del usuario */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {user?.preferencias_evento?.slice(0, 3).map((pref, idx) => (
                                                    <span key={idx} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                                                        {pref}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Eventos en común */}
                                            {user?.eventos_en_comun > 0 && (
                                                <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl">
                                                    <p className="text-sm">
                                                        <Calendar className="w-4 h-4 inline mr-1" />
                                                        {user.eventos_en_comun} eventos en común
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Animaciones de acción */}
                            {likeAnimation && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                    <div className={`animate-ping ${likeAnimation === 'like' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {likeAnimation === 'like' && <Heart className="w-32 h-32 fill-current" />}
                                        {likeAnimation === 'dislike' && <X className="w-32 h-32" />}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Estado sin más usuarios
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Heart className="w-16 h-16 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                ¡Todo listo!
                            </h2>
                            <p className="text-gray-600 text-lg mb-8 max-w-sm">
                                Has revisado a todas las personas disponibles. ¡Ajusta tus filtros para ver más!
                            </p>
                            <button
                                onClick={() => document.getElementById('my_modal_2').showModal()}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                Ajustar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Botones de acción flotantes premium - MEJORADOS */}
            {hasMoreUsers() && (
                <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center">
                    <div className="flex items-center gap-8 bg-white/90 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl border border-white/40">
                        {/* Botón Dislike - Más grande */}
                        <button
                            onClick={handleDislikeButton}
                            disabled={isAnimating}
                            className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <X className="w-8 h-8 text-white" />
                        </button>

                        {/* Botón Like - Más grande */}
                        <button
                            onClick={handleLikeButton}
                            disabled={isAnimating}
                            className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Heart className="w-8 h-8 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de verificación premium */}
            {verificar === false && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-[linear-gradient(to_bottom,rgba(40,120,250,0.7),rgba(110,79,249,0.7),rgba(188,81,246,0.7))] backdrop-blur-md">
                    <div className="text-center text-white p-8 glass-premium rounded-3xl border border-white/30 max-w-md mx-4">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CircleUserIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Perfil Requerido</h1>
                        <p className="text-white/90 mb-6">Aún no cuentas con tu perfil de acompañantes. ¡Créalo ahora y comienza a conectar!</p>
                        <button
                            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                            onClick={handdleVerificar}
                        >
                            Crear Perfil
                        </button>
                    </div>
                </div>
            )}

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
}

export default buscarMatchx;