import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import 'primereact/resources/primereact.min.css';
import InstallPrompt from './components/pwa/InstallPrompt';
import pushNotificationService from './utils/pushNotifications';
import api from './apilogin'
import AuthGuard from './components/auth/AuthGuard';

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
  const [isLoading, setIsLoading] = useState(true);  // Inicializar notificaciones push
  useEffect(() => {
    const initializeApp = async () => {
      // Los Service Workers se registran en ServiceWorkerProvider
      // para evitar conflictos y duplicación
      
      // Inicializar servicio de notificaciones push
      try {
        const initialized = await pushNotificationService.initialize();
        if (initialized) {
          console.log('✅ Servicio de notificaciones push inicializado');
        }
      } catch (error) {
        console.error('❌ Error inicializando notificaciones push:', error);
      }
    };

    initializeApp();
  }, []);

  // Configurar listeners de notificaciones
  useEffect(() => {
    const handleNotificationReceived = (event) => {
      console.log('📨 Nueva notificación recibida:', event.detail);
    };

    const handleLikeNotification = (event) => {
      console.log('💕 Notificación de like:', event.detail);
      showNotificationToast(`💕 ${event.detail.liker_name} te dio like!`, 'like');
    };

    const handleMatchNotification = (event) => {
      console.log('🎉 Notificación de match:', event.detail);
      showNotificationToast(`🎉 ¡Match con ${event.detail.match_name}!`, 'match');
    };

    const handleMessageNotification = (event) => {
      console.log('💬 Notificación de mensaje:', event.detail);
      showNotificationToast(`💬 Nuevo mensaje de ${event.detail.sender_name}`, 'message');
    };

    const handleEventNotification = (event) => {
      console.log('🎪 Notificación de evento:', event.detail);
      showNotificationToast(`🎪 ${event.detail.event_title}`, 'event');
    };

    // Agregar listeners
    window.addEventListener('notification:received', handleNotificationReceived);
    window.addEventListener('notification:like', handleLikeNotification);
    window.addEventListener('notification:match', handleMatchNotification);
    window.addEventListener('notification:message', handleMessageNotification);
    window.addEventListener('notification:event', handleEventNotification);

    // Cleanup
    return () => {
      window.removeEventListener('notification:received', handleNotificationReceived);
      window.removeEventListener('notification:like', handleLikeNotification);
      window.removeEventListener('notification:match', handleMatchNotification);
      window.removeEventListener('notification:message', handleMessageNotification);
      window.removeEventListener('notification:event', handleEventNotification);
    };
  }, []);

  // Función para mostrar toasts de notificaciones
  const showNotificationToast = (message, type) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    const colors = {
      like: 'linear-gradient(135deg, #ec4899, #be185d)',
      match: 'linear-gradient(135deg, #10b981, #059669)',
      message: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      event: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      success: 'linear-gradient(135deg, #10b981, #059669)'
    };

    toast.style.background = colors[type] || colors.success;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto-remover después de 4 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  // // Manejar notificaciones recibidas
  // useEffect(() => {
  //   if (notification) {
  //     console.log('📨 Nueva notificación recibida:', notification);

  //     // Manejar diferentes tipos de notificaciones
  //     const { data } = notification;
      
  //     if (data?.type === 'message') {
  //       // Mostrar toast para mensajes
  //       showNotificationToast(`💬 Nuevo mensaje de ${data.sender_name}`, 'message');
        
  //       // Opcional: actualizar lista de conversaciones si estás en la página de chat
  //       if (window.location.pathname.includes('/chat')) {
  //         window.dispatchEvent(new CustomEvent('refreshChats'));
  //       }
  //     } 
  //     else if (data?.type === 'match') {
  //       showNotificationToast(`🎉 ¡Nuevo match con ${data.match_name}!`, 'match');
        
  //       // Actualizar contador de matches
  //       if (window.location.pathname.includes('/match')) {
  //         window.dispatchEvent(new CustomEvent('refreshMatches'));
  //       }
  //     } 
  //     else if (data?.type === 'like') {
  //       showNotificationToast(`💕 ${data.liker_name} te dio like!`, 'like');
        
  //       // Actualizar contador de likes
  //       if (window.location.pathname.includes('/verLike')) {
  //         window.dispatchEvent(new CustomEvent('refreshLikes'));
  //       }
  //     }
  //     else if (data?.type === 'event') {
  //       showNotificationToast(`🎪 ${data.event_title}`, 'event');
  //     }
  //   }
  // }, [notification]);

  // // Función para mostrar toasts de notificaciones
  // const showNotificationToast = (message, type) => {
  //   const toast = document.createElement('div');
  //   toast.style.cssText = `
  //     position: fixed;
  //     top: 20px;
  //     right: 20px;
  //     background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  //     color: white;
  //     padding: 16px 20px;
  //     border-radius: 12px;
  //     box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  //     z-index: 10000;
  //     max-width: 350px;
  //     animation: slideInRight 0.3s ease-out;
  //     cursor: pointer;
  //     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  //   `;
    
  //   const icons = {
  //     message: '💬',
  //     match: '🎉',
  //     like: '💕',
  //     event: '🎪',
  //     default: '🔔'
  //   };
    
  //   toast.innerHTML = `
  //     <div style="display: flex; align-items: center; gap: 12px;">
  //       <div style="font-size: 24px;">${icons[type] || icons.default}</div>
  //       <div style="flex: 1; font-weight: 500;">${message}</div>
  //       <button onclick="this.parentElement.parentElement.remove()" style="
  //         background: rgba(255,255,255,0.2);
  //         border: none;
  //         color: white;
  //         width: 24px;
  //         height: 24px;
  //         border-radius: 50%;
  //         cursor: pointer;
  //         font-size: 16px;
  //       ">×</button>
  //     </div>
  //   `;
    
  //   document.body.appendChild(toast);
    
  //   // Auto-remover después de 4 segundos
  //   setTimeout(() => {
  //     if (toast.parentNode) {
  //       toast.style.animation = 'slideOutRight 0.3s ease-in';
  //       setTimeout(() => toast.remove(), 300);
  //     }
  //   }, 4000);
  // };

  // // Función para solicitar permisos de notificación
  // const handleRequestNotifications = async () => {
  //   if (isSupported && user) {
  //     try {
  //       console.log('🔔 Solicitando permisos de notificación...');
  //       const fcmToken = await requestPermissions();
        
  //       if (fcmToken) {
  //         console.log('✅ Notificaciones habilitadas exitosamente');
  //         showNotificationToast('🔔 ¡Notificaciones activadas correctamente!', 'success');
  //       } else {
  //         console.log('❌ No se pudieron habilitar las notificaciones');
  //         showNotificationToast('❌ No se pudieron activar las notificaciones', 'error');
  //       }
  //     } catch (error) {
  //       console.error('❌ Error al solicitar notificaciones:', error);
  //       showNotificationToast('❌ Error al activar notificaciones', 'error');
  //     }
  //   }
  // };

  // Mostrar loading mientras se carga el usuario
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Cargando Ibento...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="App">
      {/* Banner para solicitar notificaciones */}
      {/* {user && isSupported && !token && (
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
      )} */}      <Router>
        <AuthGuard>
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
        </AuthGuard>
      </Router>

      {/* Componentes adicionales */}
      {/* <InstallPrompt /> */}
      {/* <NotificationManager /> */}

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