import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import 'primereact/resources/primereact.min.css';
import InstallPrompt from './components/pwa/InstallPrompt';
import { useNotifications } from './hooks/useNotifications';
import NotificationManager from './notificationManager';
import api from './apilogin'

// -------------------------- RUTAS -----------------------------------------
// Auth & Register
import Register from "./components/accounts/Register";
import Confirm from "./components/accounts/Confirm";
import Login from "./components/accounts/Login";
import Logout from "./components/accounts/logout";
import VerificarCorreo from "./components/accounts/VerificarCorreo";

// Recuperar Cuenta
import RecuperarContrasena from "./components/accounts/resetPassword/recuperarContrasena";
import IngresarCodigo from "./components/accounts/resetPassword/validarCodigo";
import NuevaContrasena from "./components/accounts/resetPassword/nuevaContrasena";

// Match
import Perfil from "./components/usuario/Perfil";
import SideBar from "./components/usuario/sidebar";
import EditarPerfil from "./components/usuario/EditarPerfil";
import EditarIntereses from "./components/usuario/Intereses";
import Favoritos from "./components/usuario/Favoritos";
import Guardados from "./components/usuario/Guardados";
import VerificarPerfil from "./components/usuario/verificar";
import PerfilCheck from "./components/usuario/PerfilVerificado";
import PerfilRepetido from "./components/usuario/profileRepeat";
import BuscarMatches from "./components/match/BuscarMatch";
import Perfiles from "./components/match/PerfilUsers";
import VerMatch from "./components/match/verMatches";
import Matches from "./components/match/itsMatch";
import MisMatches from "./components/match/matches";
import Like from "./components/match/verLike";
import Chat from "./components/match/chat";

// Eventos
import EventoPage from "./components/eventos/eventoPage";
import PrincipalEventos from "./components/eventos/principalEventos";
import MainLayout from "./layouts/MainLayout";
import Busqueda from "./components/eventos/busqueda";
import BusquedaCategoria from "./components/eventos/searchCategories";

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token, notification, isSupported, requestPermissions } = useNotifications(user);

  // Obtener usuario actual desde localStorage o API
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Intentar obtener usuario desde localStorage primero
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access');
        
        if (storedUser && accessToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ Usuario cargado desde localStorage:', userData);
        } else {
          // Si no hay usuario en localStorage, verificar si hay token válido
          if (accessToken) {
            try {
              // Verificar token con el servidor - CORREGIR LA RUTA
              const response = await api.get('/usuarios/info_to_edit/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              });
              
              if (response.data) {
                const userData = {
                  id: response.data._id,
                  _id: response.data._id,
                  email: response.data.email || '',
                  nombre: response.data.nombre || ''
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('✅ Usuario obtenido del servidor:', userData);
              }
            } catch (error) {
              console.log('❌ Token inválido, limpiando localStorage');
              localStorage.removeItem('access');
              localStorage.removeItem('refresh');
              localStorage.removeUser('user');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error inicializando usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Registrar service workers
  useEffect(() => {
    const registerServiceWorkers = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Registrar el service worker principal (sw.js)
          const swRegistration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ SW principal registrado:', swRegistration);

          // Registrar el service worker de Firebase Messaging
          const fcmRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ FCM SW registrado:', fcmRegistration);
          
        } catch (registrationError) {
          console.log('❌ Error registrando Service Workers:', registrationError);
        }
      }
    };

    registerServiceWorkers();
  }, []);

  // Manejar notificaciones recibidas
  useEffect(() => {
    if (notification) {
      console.log('📨 Nueva notificación recibida:', notification);

      // Manejar diferentes tipos de notificaciones
      const { data } = notification;
      
      if (data?.type === 'message') {
        // Mostrar toast para mensajes
        showNotificationToast(`💬 Nuevo mensaje de ${data.sender_name}`, 'message');
        
        // Opcional: actualizar lista de conversaciones si estás en la página de chat
        if (window.location.pathname.includes('/chat')) {
          window.dispatchEvent(new CustomEvent('refreshChats'));
        }
      } 
      else if (data?.type === 'match') {
        showNotificationToast(`🎉 ¡Nuevo match con ${data.match_name}!`, 'match');
        
        // Actualizar contador de matches
        if (window.location.pathname.includes('/match')) {
          window.dispatchEvent(new CustomEvent('refreshMatches'));
        }
      } 
      else if (data?.type === 'like') {
        showNotificationToast(`💕 ${data.liker_name} te dio like!`, 'like');
        
        // Actualizar contador de likes
        if (window.location.pathname.includes('/verLike')) {
          window.dispatchEvent(new CustomEvent('refreshLikes'));
        }
      }
      else if (data?.type === 'event') {
        showNotificationToast(`🎪 ${data.event_title}`, 'event');
      }
    }
  }, [notification]);

  // Función para mostrar toasts de notificaciones
  const showNotificationToast = (message, type) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const icons = {
      message: '💬',
      match: '🎉',
      like: '💕',
      event: '🎪',
      default: '🔔'
    };
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">${icons[type] || icons.default}</div>
        <div style="flex: 1; font-weight: 500;">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  };

  // Función para solicitar permisos de notificación
  const handleRequestNotifications = async () => {
    if (isSupported && user) {
      try {
        console.log('🔔 Solicitando permisos de notificación...');
        const fcmToken = await requestPermissions();
        
        if (fcmToken) {
          console.log('✅ Notificaciones habilitadas exitosamente');
          showNotificationToast('🔔 ¡Notificaciones activadas correctamente!', 'success');
        } else {
          console.log('❌ No se pudieron habilitar las notificaciones');
          showNotificationToast('❌ No se pudieron activar las notificaciones', 'error');
        }
      } catch (error) {
        console.error('❌ Error al solicitar notificaciones:', error);
        showNotificationToast('❌ Error al activar notificaciones', 'error');
      }
    }
  };

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Ibento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Banner para solicitar notificaciones */}
      {user && isSupported && !token && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 text-center shadow-lg">
          <p className="mb-3 font-medium">
            🔔 ¡Activa las notificaciones para no perderte ningún match o mensaje!
          </p>
          <button
            onClick={handleRequestNotifications}
            className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-md"
          >
            Activar Notificaciones
          </button>
        </div>
      )}

      {/* Panel de debug (solo desarrollo) */}
      {True && (
        <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-3 rounded-lg text-xs font-mono shadow-lg z-50">
          <div className="space-y-1">
            <div>🔔 Notificaciones: {isSupported ? '✅ Soportadas' : '❌ No soportadas'}</div>
            <div>🎯 Token FCM: {token ? '✅ Configurado' : '❌ No configurado'}</div>
            <div>👤 Usuario: {user ? `✅ ${user.nombre || user.email}` : '❌ No logueado'}</div>
            <div>🌐 Entorno: {import.meta.env.DEV ? 'Desarrollo' : 'Producción'}</div>
          </div>
        </div>
      )}


      <Router>
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/" element={<Login />} />
          <Route path="/crear-cuenta" element={<Register />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />
          <Route path="/confirmar/:token" element={<Confirm />} />
          <Route path="/logout" element={<Logout />} />

          {/* Rutas de recuperación de contraseña */}
          <Route path="/recuperar-cuenta" element={<RecuperarContrasena />} />
          <Route path="/recuperar-cuenta-codigo" element={<IngresarCodigo />} />
          <Route path="/recuperar-cuenta-nueva-contrasena" element={<NuevaContrasena />} />

          {/* Rutas principales de la aplicación */}
          <Route path="/ibento" element={<MainLayout />}>
            {/* Eventos */}
            <Route path="eventos" element={<PrincipalEventos />} />
            <Route path="eventos/:eventId" element={<EventoPage />} />
            <Route path="busqueda" element={<Busqueda />} />
            <Route path="busqueda/:query" element={<BusquedaCategoria />} />

            {/* Perfil y usuario */}
            <Route path="perfil" element={<Perfil />} />
            <Route path="editarPerfil" element={<EditarPerfil />} />
            <Route path="editarIntereses" element={<EditarIntereses />} />
            <Route path="favoritos" element={<Favoritos />} />
            <Route path="guardados" element={<Guardados />} />
            <Route path="verificar" element={<VerificarPerfil />} />
            <Route path="profileVerify" element={<PerfilCheck />} />
            <Route path="profileRepeat" element={<PerfilRepetido />} />

            {/* Matches y chat */}
            <Route path="matches" element={<BuscarMatches />} />
            <Route path="verPerfil" element={<Perfiles />} />
            <Route path="verMatches" element={<VerMatch />} />
            <Route path="itsMatch" element={<Matches />} />
            <Route path="match" element={<MisMatches />} />
            <Route path="verLike" element={<Like />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </Router>

      {/* Componentes adicionales */}
      <InstallPrompt />
      <NotificationManager />

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}