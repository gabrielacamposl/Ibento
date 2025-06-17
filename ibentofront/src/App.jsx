// src/App.js - ACTUALIZADO CON NOTIFICACIONES DATING
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import 'primereact/resources/primereact.min.css';
import InstallPrompt from './components/pwa/InstallPrompt';
import datingNotificationService from './utils/datingNotifications';
import universalNotificationService from './utils/universalNotifications';

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
import VerificarRostro from "./components/usuario/verificarPerfil/face_validation";

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
  // 🌍 ESTADO UNIVERSAL DE NOTIFICACIONES
  const [notificationStatus, setNotificationStatus] = useState({
    platform: 'unknown',
    isInitialized: false,
    hasPermission: false,
    method: 'none'
  });

  // 🚀 INICIALIZAR SISTEMA UNIVERSAL
  useEffect(() => {
    const initializeUniversalApp = async () => {
      console.log('🚀 Inicializando Ibento Universal...');

      // Registrar Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const swRegistration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registrado:', swRegistration);
        } catch (error) {
          console.log('❌ Error registrando Service Worker:', error);
        }
      }

      // 🌍 Inicializar notificaciones universales
      try {
        const initialized = await universalNotificationService.initialize();
        const status = universalNotificationService.getStatus();
        
        setNotificationStatus(status);
        
        if (initialized) {
          console.log(`✅ Notificaciones ${status.platform} inicializadas:`, status);
          
          // Mostrar notificación de bienvenida específica por plataforma
          setTimeout(() => {
            showPlatformWelcomeMessage(status.platform);
          }, 2000);
        } else {
          console.log('⚠️ Notificaciones en modo fallback:', status);
        }
      } catch (error) {
        console.error('❌ Error inicializando notificaciones universales:', error);
      }
    };

    initializeUniversalApp();

    // Actualizar estado cada 10 segundos
    const statusInterval = setInterval(() => {
      setNotificationStatus(universalNotificationService.getStatus());
    }, 10000);

    return () => clearInterval(statusInterval);
  }, []);

  // 🌍 CONFIGURAR LISTENERS UNIVERSALES
  useEffect(() => {
    // Listeners para eventos de notificación
    const handleLikeNotification = (event) => {
      console.log('💕 Like notification:', event.detail);
      showUniversalToast(`💕 ${event.detail.userName || 'Alguien'} te dio like!`, 'like');
    };

    const handleMatchNotification = (event) => {
      console.log('🎉 Match notification:', event.detail);
      showUniversalToast(`🎉 ¡Match con ${event.detail.userName || 'alguien'}!`, 'match');
    };

    const handleMessageNotification = (event) => {
      console.log('💬 Message notification:', event.detail);
      showUniversalToast(`💬 Mensaje de ${event.detail.userName || 'alguien'}`, 'message');
    };

    // Agregar listeners
    window.addEventListener('notification:like', handleLikeNotification);
    window.addEventListener('notification:match', handleMatchNotification);
    window.addEventListener('notification:message', handleMessageNotification);

    // Cleanup
    return () => {
      window.removeEventListener('notification:like', handleLikeNotification);
      window.removeEventListener('notification:match', handleMatchNotification);
      window.removeEventListener('notification:message', handleMessageNotification);
    };
  }, []);

  // 🎉 MENSAJE DE BIENVENIDA POR PLATAFORMA
  const showPlatformWelcomeMessage = (platform) => {
    const messages = {
      'ios-pwa': '🍎 ¡Ibento instalado en iOS! Las notificaciones están optimizadas para tu iPhone.',
      'ios-safari': '🍎 ¡Bienvenido desde Safari! Para mejor experiencia, instala Ibento en tu pantalla de inicio.',
      'android-pwa': '🤖 ¡Ibento instalado en Android! Las notificaciones push están activas.',
      'android-browser': '🤖 ¡Bienvenido desde Android! Instala Ibento como app para mejor experiencia.',
      'windows': '💻 ¡Bienvenido desde Windows! Las notificaciones de escritorio están activas.',
      'macos': '🖥️ ¡Bienvenido desde Mac! Las notificaciones están optimizadas para macOS.',
      'desktop': '💻 ¡Bienvenido desde Desktop! Las notificaciones web están activas.'
    };

    const message = messages[platform] || '🌍 ¡Notificaciones universales activas!';
    showUniversalToast(message, 'success');
  };

  // 🧪 FUNCIONES DE PRUEBA UNIVERSALES
  const testUniversalNotifications = {
    match: () => {
      universalNotificationService.notifyMatch('María García', '/test-photo.jpg', 'user123');
    },
    like: () => {
      universalNotificationService.notifyLike('Juan Pérez', '/test-photo2.jpg', 'user456');
    },
    message: () => {
      universalNotificationService.notifyMessage('Ana López', '¡Hola! Me encanta tu perfil 😊', '/test-photo3.jpg', 'user789');
    },
    all: () => {
      universalNotificationService.testAllPlatforms();
    }
  };

  // 🎨 TOAST UNIVERSAL
  const showUniversalToast = (message, type) => {
    const toast = document.createElement('div');
    
    const colors = {
      like: 'linear-gradient(135deg, #ec4899, #be185d)',
      match: 'linear-gradient(135deg, #10b981, #059669)',
      message: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
    };

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.success};
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      max-width: 350px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      cursor: pointer;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remover
    toast.onclick = () => toast.remove();
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  };

  return (
    <div className="App">
      
      <Router>
        <AuthGuard>
          <Routes>
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
              <Route path="verificar-rostro" element={<VerificarRostro />} />

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
      {/*<InstallPrompt />*/}
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
