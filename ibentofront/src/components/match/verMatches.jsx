import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, Star, Zap, ArrowLeft, Users, Sparkles, Flame } from 'lucide-react';
import api from '../../api';
import '../../assets/css/swipe-animations.css';

const verMatch = () => {
    const navigate = useNavigate();
    const cardRefs = useRef([]);
    const containerRef = useRef(null);
    
    // Estados para el swipe system
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [likeAnimation, setLikeAnimation] = useState(null);
    const [superLikeCount, setSuperLikeCount] = useState(3);
    
    // Estados para usuarios
    const [UsuarioLike, setUsuarioLike] = useState([]);
    const [removedUsers, setRemovedUsers] = useState(new Set());

    // Obtener usuarios que me han dado like
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access');
            try {
                const response = await api.get('likes-recibidos/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {
                    console.log('Usuarios disponibles:', response.data);
                    setUsuarioLike(response.data);
                } else {
                    console.error('Error en la respuesta:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchData();
    }, []);

    // Funciones de interacción con la API
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
            });
            
            if (response.data?.match_id) {
                setTimeout(() => {
                    navigate(`../itsMatch/?id=${response.data.match_id}`);
                }, 1000);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDislike = async (user_id) => {
        try {
            const token = localStorage.getItem('access');
            await api.post('interaccion/', {
                "usuario_destino": user_id,
                "tipo_interaccion": "dislike"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Haptic feedback para dispositivos móviles
    const triggerHaptic = (intensity = 'light') => {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [50],
                success: [10, 50, 10],
                superlike: [20, 100, 20, 100, 20]
            };
            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    };

    // Efectos de partículas
    const createParticles = (type) => {
        const particles = [];
        const count = type === 'superlike' ? 20 : 10;
        
        for (let i = 0; i < count; i++) {
            particles.push({
                id: Math.random(),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                color: type === 'like' ? '#10B981' : type === 'dislike' ? '#EF4444' : '#F59E0B',
                size: Math.random() * 8 + 4
            });
        }
        
        return particles;
    };

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
            
            // Mostrar indicadores
            if (Math.abs(deltaX) > 50) {
                setSwipeDirection(deltaX > 0 ? 'like' : 'dislike');
                triggerHaptic('light');
            } else if (deltaY < -100 && Math.abs(deltaX) < 100) {
                setSwipeDirection('superlike');
                triggerHaptic('light');
            } else {
                setSwipeDirection(null);
            }
        }
    }, [isDragging, touchStart, currentIndex, isAnimating]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging || isAnimating) return;
        
        setIsDragging(false);
        const deltaX = touchCurrent.x;
        const deltaY = touchCurrent.y;
        
        const card = cardRefs.current[currentIndex];
        if (!card) return;
        
        card.style.cursor = 'grab';
        
        const threshold = 120;
        const superLikeThreshold = -150;
        
        if (deltaY < superLikeThreshold && Math.abs(deltaX) < 100 && superLikeCount > 0) {
            performSuperLike();
        } else if (Math.abs(deltaX) > threshold) {
            const isLike = deltaX > 0;
            performSwipe(isLike);
        } else {
            resetCard(card);
        }
        
        setSwipeDirection(null);
        setTouchCurrent({ x: 0, y: 0 });
    }, [isDragging, touchCurrent, currentIndex, isAnimating, superLikeCount]);

    // Limpiar eventos globales
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleMouseUp();
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Sistema de swipe avanzado
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
            
            // Mostrar indicadores de like/dislike
            if (Math.abs(deltaX) > 50) {
                setSwipeDirection(deltaX > 0 ? 'like' : 'dislike');
            } else {
                setSwipeDirection(null);
            }
        }
    }, [isDragging, touchStart, currentIndex, isAnimating]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging || isAnimating) return;
        
        setIsDragging(false);
        const deltaX = touchCurrent.x;
        const deltaY = touchCurrent.y;
        
        const card = cardRefs.current[currentIndex];
        if (!card) return;
        
        const threshold = 120;
        const superLikeThreshold = -150;
        
        if (deltaY < superLikeThreshold && Math.abs(deltaX) < 100 && superLikeCount > 0) {
            // Super Like
            performSuperLike();
        } else if (Math.abs(deltaX) > threshold) {
            // Like o Dislike
            const isLike = deltaX > 0;
            performSwipe(isLike);
        } else {
            // Regresar a posición original
            resetCard(card);
        }
        
        setSwipeDirection(null);
        setTouchCurrent({ x: 0, y: 0 });
    }, [isDragging, touchCurrent, currentIndex, isAnimating, superLikeCount]);

    const performSwipe = async (isLike) => {
        if (isAnimating || currentIndex >= UsuarioLike.length) return;
        
        setIsAnimating(true);
        setLikeAnimation(isLike ? 'like' : 'dislike');
        
        const card = cardRefs.current[currentIndex];
        const user = UsuarioLike[currentIndex];
          if (card) {
            const exitX = isLike ? window.innerWidth + 100 : -window.innerWidth - 100;
            const exitRotation = isLike ? 30 : -30;
            
            // Agregar efecto de brillo
            card.classList.add(isLike ? 'swipe-like-glow' : 'swipe-dislike-glow');
            
            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = `translateX(${exitX}px) rotate(${exitRotation}deg) scale(0.8)`;
            card.style.opacity = '0';
        }
        
        // Ejecutar acción
        if (isLike) {
            await handleMatch(user._id);
            triggerHaptic('success');
        } else {
            await handleDislike(user._id);
            triggerHaptic('light');
        }
        
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setRemovedUsers(prev => new Set([...prev, user._id]));
            setIsAnimating(false);
            setLikeAnimation(null);
        }, 600);
    };

    const performSuperLike = async () => {
        if (isAnimating || currentIndex >= UsuarioLike.length || superLikeCount <= 0) return;
        
        setIsAnimating(true);
        setLikeAnimation('superlike');
        setSuperLikeCount(prev => prev - 1);
        
        const card = cardRefs.current[currentIndex];
        const user = UsuarioLike[currentIndex];
          if (card) {
            // Agregar efecto de brillo dorado
            card.classList.add('swipe-superlike-glow');
            
            card.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = `translateY(-${window.innerHeight + 100}px) rotate(0deg) scale(1.2)`;
            card.style.opacity = '0';
        }
        
        await handleMatch(user._id);
        triggerHaptic('superlike');
        
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setRemovedUsers(prev => new Set([...prev, user._id]));
            setIsAnimating(false);
            setLikeAnimation(null);
        }, 800);
    };

    const resetCard = (card) => {
        card.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'translateX(0px) translateY(0px) rotate(0deg) scale(1)';
        card.style.opacity = '1';
    };

    // Funciones para botones
    const handleLikeButton = () => performSwipe(true);
    const handleDislikeButton = () => performSwipe(false);
    const handleSuperLikeButton = () => performSuperLike();

    const getCurrentUser = () => {
        return UsuarioLike[currentIndex];
    };

    const hasMoreUsers = () => {
        return currentIndex < UsuarioLike.length;
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        return age > 0 ? `, ${age}` : '';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header Premium */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
                <div className="flex items-center justify-between p-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                            <p className="text-sm text-gray-600">{UsuarioLike.length - currentIndex} personas te esperan</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 rounded-xl shadow-lg">
                            <Star className="w-4 h-4 text-white" />
                            <span className="text-white font-bold text-sm">{superLikeCount}</span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Card Stack Container */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-8 pb-32">
                <div 
                    ref={containerRef}
                    className="relative w-full max-w-sm mx-auto"
                    style={{ height: '600px' }}
                >
                    {hasMoreUsers() ? (
                        <>
                            {/* Stack de tarjetas */}
                            {UsuarioLike.slice(currentIndex, currentIndex + 3).map((user, stackIndex) => {
                                const actualIndex = currentIndex + stackIndex;
                                const zIndex = 3 - stackIndex;
                                const scale = 1 - stackIndex * 0.05;
                                const translateY = stackIndex * 8;
                                
                                return (
                                    <div
                                        key={user._id}
                                        ref={el => cardRefs.current[actualIndex] = el}
                                        className={`absolute inset-0 glass-premium rounded-3xl overflow-hidden shadow-2xl border border-white/30 ${
                                            stackIndex === 0 ? 'cursor-grab active:cursor-grabbing' : ''
                                        }`}                                        style={{
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
                                        <div className="relative h-4/5">
                                            <img
                                                src={user.profile_pic}
                                                alt={user.nombre}
                                                className="w-full h-full object-cover"
                                                draggable={false}
                                            />
                                            
                                            {/* Overlay gradiente */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                                            
                                            {/* Indicadores de swipe */}
                                            {stackIndex === 0 && swipeDirection && (
                                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                                    swipeDirection === 'like' 
                                                        ? 'bg-green-500/20' 
                                                        : 'bg-red-500/20'
                                                }`}>
                                                    <div className={`p-6 rounded-full border-4 ${
                                                        swipeDirection === 'like'
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
                                            
                                            {/* Badges de información */}
                                            <div className="absolute top-4 left-4 right-4 flex justify-between">
                                                <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                                                    <span className="text-white text-sm font-medium">Online</span>
                                                </div>
                                                {/* <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1 rounded-full">
                                                    <span className="text-white text-sm font-bold">Premium</span>
                                                </div> */}
                                            </div>
                                        </div>

                                        {/* Información del usuario */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-black">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h2 className="text-2xl font-bold">
                                                        {user.nombre}{calculateAge(user.fecha_nacimiento)}
                                                    </h2>
                                                    <p className="text-white/80 flex items-center">
                                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                                        A 2 km de distancia
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => navigate('../verLike')}
                                                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
                                                >
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </button>
                                            </div>
                                            
                                            {/* Intereses */}
                                            <div className="flex flex-wrap gap-2 text-black">
                                                {['🎵 Música', '🎭 Teatro', '🏃‍♂️ Deportes'].map((interest, idx) => (
                                                    <span key={idx} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Animaciones de acción */}
                            {likeAnimation && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                    <div className={`animate-ping ${
                                        likeAnimation === 'like' ? 'text-green-400' :
                                        likeAnimation === 'dislike' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                        {likeAnimation === 'like' && <Heart className="w-32 h-32 fill-current" />}
                                        {likeAnimation === 'dislike' && <X className="w-32 h-32" />}
                                        {likeAnimation === 'superlike' && <Star className="w-32 h-32 fill-current" />}
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
                                Has revisado a todas las personas que te han dado like. ¡Revisa tus matches!
                            </p>
                            <button
                                onClick={() => navigate('../matches')}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                Ver Matches
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Botones de acción flotantes */}
            {hasMoreUsers() && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="flex items-center space-x-6 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/30 shadow-2xl">
                        {/* Botón Dislike */}
                        <button
                            onClick={handleDislikeButton}
                            disabled={isAnimating}
                            className="p-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Botón Super Like */}
                        {/* <button
                            onClick={handleSuperLikeButton}
                            disabled={isAnimating || superLikeCount <= 0}
                            className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative"
                        >
                            <Star className="w-6 h-6 text-white" />
                            {superLikeCount > 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-orange-500">{superLikeCount}</span>
                                </div>
                            )}
                        </button> */}

                        {/* Botón Like */}
                        <button
                            onClick={handleLikeButton}
                            disabled={isAnimating}
                            className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Heart className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default verMatch;
