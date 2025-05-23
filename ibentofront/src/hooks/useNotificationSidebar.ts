import { useState, useEffect, useCallback } from 'react';
import api from '../api'; 

export interface NotificationUser {
  id: string;
  nombre: string;
  foto?: string;
}

export interface NotificationData {
  match_id?: string;
  conversacion_id?: string;
  usuario_id?: string;
  mensajes_no_leidos?: number;
}

export interface Notification {
  id: string;
  tipo: 'match' | 'like' | 'mensaje';
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  usuario_relacionado: NotificationUser;
  accion: 'abrir_chat' | 'ver_perfil';
  data: NotificationData;
}

export interface NotificationsResponse {
  notificaciones: Notification[];
  total: number;
  no_leidas: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const response = await api.get('notificaciones/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: NotificationsResponse = response.data;
      setNotifications(data.notificaciones);
      setUnreadCount(data.no_leidas);
      
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.error || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, leido: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, leido: true }))
    );
    setUnreadCount(0);
  }, []);

  const handleNotificationAction = useCallback((notification: Notification, navigate: any) => {
    // Marcar como leída
    markAsRead(notification.id);

    // Ejecutar acción según el tipo
    switch (notification.accion) {
      case 'abrir_chat':
        if (notification.data.conversacion_id) {
          navigate(`/chat/${notification.data.conversacion_id}`);
        }
        break;
      case 'ver_perfil':
        if (notification.data.usuario_id) {
          navigate(`/perfil/${notification.data.usuario_id}`);
        }
        break;
    }
  }, [markAsRead]);

  useEffect(() => {
    fetchNotifications();
    
    // Opcional: Configurar polling para actualizar notificaciones cada cierto tiempo
    const interval = setInterval(fetchNotifications, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
  };
};