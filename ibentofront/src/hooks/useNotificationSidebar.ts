import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';

interface Notificacion {
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    fecha: string;
    leido: boolean;
    usuario_relacionado?: any;
    accion?: string;
    data?: any;
}

export function useUserNotifications(token: string | null) {
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const prevUnreadRef = useRef<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const markAsRead = async () => {
    if (!token) return;

    try {
        await axios.post('https://ibento.onrender.com/api/notificaciones/marcar_leidas/', {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Marcar como leídas localmente
        setNotifications(prev =>
            prev.map(n => ({ ...n, leido: true }))
        );
        setUnreadCount(0);
    } catch (err) {
        console.error("Error al marcar como leídas", err);
    }
};


    const fetchNotifications = useCallback(async () => {
        if (!token) return;

        try {
            const response = await axios.get('https://ibento.onrender.com/api/notificaciones/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data.notificaciones;
            const unread = data.filter((n: Notificacion) => !n.leido).length;

            // Detectar nuevos
            if (unread > prevUnreadRef.current) {
                audioRef.current?.play().catch(err => console.error("Error reproduciendo sonido", err));
            }

            prevUnreadRef.current = unread;
            setUnreadCount(unread);
            setNotifications(data);
        } catch (err) {
            console.error(err);
            setError("Error cargando notificaciones");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        audioRef.current = new Audio('/sounds/notification.mp3');

        fetchNotifications(); // inicial

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications, token]);

    return { notifications, unreadCount, loading, error, fetchNotifications, markAsRead };


    
}

