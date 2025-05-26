import { useState, useEffect, useCallback } from 'react';
import api from '../api';

interface NotificationUser {
  id: string;
  nombre: string;
  foto?: string;
}

interface NotificationData {
  match_id?: string;
  conversacion_id?: string;
  usuario_id?: string;
  mensajes_no_leidos?: number;
}

interface Notification {
  id: string;
  tipo: 'match' | 'like' | 'mensaje' | 'event';
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  usuario_relacionado: NotificationUser;
  accion: 'abrir_chat' | 'ver_perfil' | 'view_event';
  data: NotificationData;
}

interface NotificationsResponse {
  notificaciones: Notification[];
  total: number;
  no_leidas: number;
}

export const useUserNotifications = (token: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setError('No hay token de acceso');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('notificaciones/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: NotificationsResponse = response.data;
      setNotifications(data.notificaciones || []);
      setUnreadCount(data.no_leidas || 0);
      
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      const errorMessage = err.response?.data?.error || 'Error al cargar notificaciones';
      setError(errorMessage);
      
      // Si es error de autenticación, limpiar token
      if (err.response?.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(() => {
    // Marcar todas las notificaciones como leídas localmente
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, leido: true }))
    );
    setUnreadCount(0);
    
    // Aquí podrías enviar una petición al backend para marcar como leídas
    // if (notifications.length > 0) {
    //   api.post('/api/notificaciones/mark-read/', { notification_ids: notifications.map(n => n.id) });
    // }
  }, []);

  const markSingleAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, leido: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const addNotification = useCallback((newNotification: Notification) => {
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.leido) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Fetch inicial
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  // Listener para eventos de notificación desde el service worker
  useEffect(() => {
    const handleNotificationReceived = (event: any) => {
      console.log('Nueva notificación recibida:', event.detail);
      // Refrescar notificaciones cuando se recibe una nueva
      fetchNotifications();
    };

    window.addEventListener('notification:received', handleNotificationReceived);
    
    return () => {
      window.removeEventListener('notification:received', handleNotificationReceived);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markSingleAsRead,
    addNotification,
    clearNotifications,
  };
};