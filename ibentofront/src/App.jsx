// src/App.js - ACTUALIZADO CON NOTIFICACIONES DATING
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import 'primereact/resources/primereact.min.css';
import InstallPrompt from './components/pwa/InstallPrompt';
// 🔥 CAMBIAR ESTA LÍNEA - USAR EL NUEVO SERVICIO 🔥
import datingNotificationService from './utils/datingNotifications';
import api from './apilogin'
import AuthGuard from './components/auth/AuthGuard';

// -------------------------- RUTAS (TU CÓDIGO ORIGINAL) -----------------------------------------
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

// Editar Perfil
import Perfil from "./components/usuario/Perfil";
import SideBar from "./components/usuario/sidebar";
import EditarPerfil from "./components/usuario/EditarPerfil";
import EditarIntereses from "./components/usuario/Intereses";
import Favoritos from "./components/usuario/Favoritos";
import Guardados from "./components/usuario/Guardados";

// Verificar Perfil
import VerificarPerfil from "./components/usuario/verificar";
import IneValidation from "./components/usuario/verificarPerfil/ine_face_validation";
import SubirFotos from "./components/usuario/verificarPerfil/upload_photos";
import Descripcion from "./components/usuario/verificarPerfil/profile_description";
import Intereses from "./components/usuario/verificarPerfil/select_interests";

// Match
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
  
  // 🔥 ESTADO PARA NOTIFICACIONES DATING 🔥
  const [notificationStatus, setNotificationStatus] = useState({
    isInitialized: false,
    hasPermission: false,
    isSupported: false
  });

  // 🔥 INICIALIZAR SERVICE WORKERS Y NOTIFICACIONES DATING 🔥
  useEffect(() => {
    const initializeApp = async () => {
      // Registrar service workers (tu código original)
      if ('serviceWorker' in navigator) {
        try {
          // Registrar el service worker principal (sw.js) - YA ACTUALIZADO
          const swRegistration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ SW principal registrado:', swRegistration);

          // Opcional: registrar Firebase messaging SW si tienes uno separado
          // const fcmRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          // console.log('✅ FCM SW registrado:', fcmRegistration);

        } catch (registrationError) {
          console.log('❌ Error registrando Service Workers:', registrationError);
        }
      }

      // 🔥 INICIALIZAR SERVICIO DE NOTIFICACIONES DATING 🔥
      try {
        const initialized = await datingNotificationService.initialize();
        if (initialized) {
          console.log('✅ Servicio de notificaciones dating inicializado');
          
          // Mostrar notificación de bienvenida (opcional)
          setTimeout(() => {
            showNotificationToast('🎉 ¡Notificaciones habilitadas! Recibirás alertas de matches y mensajes.', 'success');
          }, 2000);
        }
        
        // Actualizar estado
        setNotificationStatus(datingNotificationService.getStatus());
        
      } catch (error) {
        console.error('❌ Error inicializando notificaciones dating:', error);
        showNotificationToast('⚠️ No se pudieron habilitar las notificaciones', 'error');
      }
    };

    initializeApp();

    // Actualizar estado de notificaciones cada 5 segundos
    const statusInterval = setInterval(() => {
      setNotificationStatus(datingNotificationService.getStatus());
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  // 🔥 CONFIGURAR LISTENERS DE NOTIFICACIONES DATING 🔥
  useEffect(() => {
    const handleNotificationReceived = (event) => {
      console.log('📨 Nueva notificación recibida:', event.detail);
    };

    const handleLikeNotification = (event) => {
      console.log('💕 Notificación de like:', event.detail);
      showNotificationToast(`💕 ${event.detail.userName || 'Alguien'} te dio like!`, 'like');
    };

    const handleMatchNotification = (event) => {
      console.log('🎉 Notificación de match:', event.detail);
      showNotificationToast(`🎉 ¡Match con ${event.detail.userName || 'alguien'}!`, 'match');
    };

    const handleMessageNotification = (event) => {
      console.log('💬 Notificación de mensaje:', event.detail);
      showNotificationToast(`💬 Nuevo mensaje de ${event.detail.userName || 'alguien'}`, 'message');
    };

    const handleEventNotification = (event) => {
      console.log('🎪 Notificación de evento:', event.detail);
      showNotificationToast(`🎪 ${event.detail.event_title || 'Nuevo evento'}`, 'event');
    };

    const handleVerificationNotification = (event) => {
      console.log('✅ Notificación de verificación:', event.detail);
      showNotificationToast('✅ ¡Tu perfil ha sido verificado!', 'success');
    };

    // Agregar listeners para notificaciones dating
    window.addEventListener('notification:received', handleNotificationReceived);
    window.addEventListener('notification:like', handleLikeNotification);
    window.addEventListener('notification:match', handleMatchNotification);
    window.addEventListener('notification:message', handleMessageNotification);
    window.addEventListener('notification:event', handleEventNotification);
    window.addEventListener('notification:verification', handleVerificationNotification);

    // Cleanup
    return () => {
      window.removeEventListener('notification:received', handleNotificationReceived);
      window.removeEventListener('notification:like', handleLikeNotification);
      window.removeEventListener('notification:match', handleMatchNotification);
      window.removeEventListener('notification:message', handleMessageNotification);
      window.removeEventListener('notification:event', handleEventNotification);
      window.removeEventListener('notification:verification', handleVerificationNotification);
    };
  }, []);

  // 🔥 FUNCIONES DE PRUEBA PARA NOTIFICACIONES DATING 🔥
  const testDatingNotifications = {
    match: () => {
      datingNotificationService.notifyMatch('María García', '/test-photo.jpg', 'user123');
    },
    like: () => {
      datingNotificationService.notifyLike('Juan Pérez', '/test-photo2.jpg', 'user456');
    },
    message: () => {
      datingNotificationService.notifyMessage('Ana López', '¡Hola! Me encanta tu perfil 😊', '/test-photo3.jpg', 'user789');
    },
    verification: () => {
      datingNotificationService.notifyVerificationComplete();
    }
  };

  // Función para mostrar toasts de notificaciones (tu código original mejorado)
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

  return (
    <div className="App">
      
      <Router>
        <AuthGuard>
          <Routes>
            {/* TUS RUTAS ORIGINALES - NO CAMBIAR */}
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
              <Route path="profileVerify" element={<PerfilCheck />} />
              <Route path="profileRepeat" element={<PerfilRepetido />} />

              {/* Verificar */}
              <Route path="verificar-ine" element={<IneValidation />} />
              <Route path="descripcion" element={<Descripcion />} />
              <Route path="subirFotos" element={<SubirFotos />} />
              <Route path="intereses" element={<Intereses />} />

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

      {/* TUS COMPONENTES ADICIONALES ORIGINALES */}
      <InstallPrompt />
      {/* <NotificationManager /> */}

      {/* Estilos para animaciones (tu código original) */}
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

// Estilos para botones de prueba (solo desarrollo)
const buttonStyle = {
  padding: '4px 8px',
  fontSize: '10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: '#3b82f6',
  color: 'white'
};