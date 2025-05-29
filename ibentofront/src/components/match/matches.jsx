import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Users, Sparkles, ArrowLeft, Menu, Search, Filter, WifiOff } from 'lucide-react';
import api from '../../api';
import LoadingSpinner from './../../assets/components/LoadingSpinner';
import offlineUtils, { ConnectionStatus, useOfflineRequest } from '../../utils/offlineUtils';
import '../../assets/css/swipe-animations.css';

const Matches = () => {
    const navigate = useNavigate();
    const { makeRequest } = useOfflineRequest();
    const [verificar, setVerificar] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [conversaciones, setConversaciones] = useState([]);
    const [futureMatches, setFutureMatches] = useState([]);
    const [Likes, setLikes] = useState([]); // Kept as Likes based on provided fixed file
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

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

    const handleFuture = () => { // Renamed
        navigate("../verMatches");
    };

    const handleVerificar = () => { // Renamed
        setTimeout(() => navigate("../verificar"), 0);
    };    useEffect(() => {
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
                    setVerificar(userData.is_ine_validated && userData.is_validated_camera);
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
        const token = localStorage.getItem('access');
        const fetchLikesData = async () => {
            try {
                const result = await makeRequest(
                    `${api.defaults.baseURL}likes-recibidos/`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    },
                    'likes-received'
                );
                
                if (result.data) {
                    setLikes(result.data);
                }
            } catch (error) {
                console.error("Error al obtener los likes recibidos:", error);
            }
        };
        if (token) {
            fetchLikesData();
        }
        // setLoading(false) is handled by the main data fetching useEffect
    }, []);    useEffect(() => {
        const token = localStorage.getItem('access');
        const fetchConversationsData = async () => {
            try {
                const result = await makeRequest(
                    `${api.defaults.baseURL}mis-conversaciones/`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    },
                    'conversations'
                );
                
                if (result.data) {
                    const mensajes = [];
                    const sinMensajes = [];
                    result.data.forEach(conversacion => {
                        const formattedConversacion = {
                            conversacion_id: conversacion.conversacion_id,
                            usuario: {
                                nombre: conversacion.usuario.nombre,
                                apellido: conversacion.usuario.apellido,
                                profile_pic: conversacion.usuario.profile_pic,
                                edad: conversacion.usuario.edad
                            },
                            ultimo_mensaje: conversacion.ultimo_mensaje || 'Sin mensajes aún',
                        };
                        if (conversacion.ultimo_mensaje) {
                            mensajes.push(formattedConversacion);
                        } else {
                            sinMensajes.push(formattedConversacion);
                        }
                    });
                    setConversaciones(mensajes);
                    setFutureMatches(sinMensajes);
                } else {
                    console.log("No se pudo obtener la información de los mensajes.");
                }
            } catch (error) {
                console.error("Error al obtener los mensajes:", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchConversationsData();
        } else {
            setLoading(false); // If no token, stop loading, nothing to fetch.
        }
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            
            <div className="max-w-lg mx-auto relative z-10 pb-16"> {/* Added pb-16 */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-b-3xl sticky top-0 z-20"> {/* Made header sticky */}
                    <div className="px-6 py-8">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                <span className="text-white font-semibold text-lg">Matches</span>
                            </div>
                            <button className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <Menu className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white mb-2">Mis Matches</h1>
                            <p className="text-white/70">Conecta con personas increíbles</p>
                        </div>
                    </div>
                </div>

                {verificar === false && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 m-6 text-center shadow-2xl">
                            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Perfil de Acompañante</h2>
                            <p className="text-white/80 mb-6">Aún no cuentas con tu perfil de acompañante. ¡Créalo ahora y comienza a conectar!</p>
                            <button
                                onClick={handleVerificar}
                                className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-violet-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Crear Perfil
                            </button>
                        </div>
                    </div>                )}

                <div className="px-6 py-6 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <Heart className="w-5 h-5 text-pink-400 mr-2" />
                                Nuevos Matches
                            </h3>
                            <span className="text-white/60 text-sm">{futureMatches.length + 1}</span>
                        </div>
                        <div className="flex space-x-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>                            {/* Futuros Acompañantes Card */}
                            <div className="flex-shrink-0 w-32 h-44 relative">
                                <div
                                    onClick={handleFuture}
                                    className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <div className="relative h-full">
                                        <img
                                            src={Likes.at(-1)?.profile_pic || '/profile_empty.webp'}
                                            className="w-full h-full object-cover"
                                            alt="Futuros Acompañantes"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/60 via-purple-500/30 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 mx-auto mb-2 w-8 h-8 flex items-center justify-center">
                                                <Heart className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-white font-semibold text-xs leading-tight mb-1">
                                                Futuros
                                            </p>
                                            <p className="text-white font-semibold text-xs leading-tight mb-1">
                                                Acompañantes
                                            </p>
                                            <div className="w-2 h-2 bg-pink-400 rounded-full mx-auto animate-pulse" />
                                            <span className="text-white/90 text-xs font-medium">{Likes.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {futureMatches.map((user, index) => (
                                <div key={user.conversacion_id || index} className="flex-shrink-0 w-32 h-44 relative">
                                    <div
                                        onClick={() => navigate(`../chat/?room=${user.conversacion_id}`)}
                                        className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <div className="relative h-full">
                                            <img
                                                src={user.usuario.profile_pic || '/profile_empty.webp'}
                                                className="w-full h-full object-cover"
                                                alt={user.usuario.nombre || 'Usuario'}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                                                <p className="text-white font-semibold text-sm truncate">
                                                    {user.usuario.nombre || 'Usuario'}, {user.usuario.edad || '?'}
                                                </p>
                                                <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <MessageCircle className="w-5 h-5 text-blue-400 mr-2" />
                                Mensajes
                            </h3>
                            <span className="text-white/60 text-sm">{conversaciones.length}</span>
                        </div>
                        <div className="space-y-3">
                            {conversaciones.length === 0 ? (
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
                                    <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                                    <p className="text-white/60">No tienes conversaciones aún.</p>
                                    <p className="text-white/40 text-sm mt-2">¡Comienza a hacer matches para chatear!</p>
                                </div>
                            ) : (
                                conversaciones.map((user, index) => (
                                    <div key={user.conversacion_id || index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-xl">
                                        <button
                                            onClick={() => navigate(`../chat/?room=${user.conversacion_id}`)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <img
                                                        src={user.usuario.profile_pic || '/profile_empty.webp'}
                                                        className="w-14 h-14 object-cover rounded-full border-2 border-white/30"
                                                        alt={(user.usuario.nombre || 'Usuario') + ' profile picture'}
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white/80" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-white truncate">
                                                            {`${user.usuario.nombre || ''} ${user.usuario.apellido || ''}`.trim() || 'Usuario'}
                                                        </h4>
                                                        <span className="text-xs text-white/50">ahora</span> {/* Placeholder for timestamp */}
                                                    </div>
                                                    <p className="text-white/70 text-sm truncate">
                                                        {user.ultimo_mensaje || 'No hay mensajes'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-center space-y-1"> {/* Placeholder for unread indicator/action */}
                                                    <div className="w-2 h-2 bg-pink-400 rounded-full" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))
                            )}                        </div>
                    </div>
                </div>
            </div>
            
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

export default Matches;
