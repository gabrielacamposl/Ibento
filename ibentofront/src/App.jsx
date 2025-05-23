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
import axios from "axios";


const VAPID_P = import.meta.env.VAPID_PUBLICA;

export default function App() {
  const [user, setUser] = useState(null);
  const { token, notification, isSupported, requestPermissions } = useNotifications(user);

  useEffect(() => {
    // Obtener usuario actual (ajusta según tu lógica de auth)
    const getCurrentUser = async () => {
      try {
        const res = await api.post("login/", { email, password });
        // Guardar tokens
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        // Opcionalmente, guarda más datos del usuario
        localStorage.setItem("user", JSON.stringify({
          id: res.data.id,
          email: res.data.email,
          nombre: res.data.nombre,
        }));
        window.location.href = '/ibento/eventos';
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    getCurrentUser();
  }, []);


useEffect(() => {
  // Registrar el service worker si no está registrado
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}, []);

useEffect(() => {
  // Manejar notificaciones recibidas cuando la app está activa
  if (notification) {
    console.log('Nueva notificación recibida:', notification);

    // Aquí puedes agregar lógica adicional como:
    // - Actualizar contadores de notificaciones
    // - Refrescar datos si es necesario
    // - Mostrar toast o modal

    if (notification.data?.type === 'message') {
      // Actualizar lista de conversaciones
      // refreshConversations();
    } else if (notification.data?.type === 'match') {
      // Actualizar lista de matches
      // refreshMatches();
    } else if (notification.data?.type === 'like') {
      // Actualizar contador de likes
      // refreshLikes();
    }
  }
}, [notification]);

const handleRequestNotifications = async () => {
  if (isSupported) {
    const token = await requestPermissions();
    if (token) {
      console.log('Notificaciones habilitadas exitosamente');
      // Mostrar mensaje de éxito al usuario
    } else {
      console.log('No se pudieron habilitar las notificaciones');
      // Mostrar mensaje de error al usuario
    }
  }
};

return (
  <div className="App">
    {user && isSupported && !token && (
      <div className="bg-blue-500 text-white p-4 text-center">
        <p className="mb-2">¡Habilita las notificaciones para no perderte ningún match o mensaje! 🔔</p>
        <button
          onClick={handleRequestNotifications}
          className="bg-white text-blue-500 px-4 py-2 rounded font-semibold hover:bg-gray-100"
        >
          Habilitar Notificaciones
        </button>
      </div>
    )}

    {/* Debug info - remover en producción */}
    {process.env.NODE_ENV === 'development' && (
      <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs">
        <div>Notificaciones: {isSupported ? 'Soportadas' : 'No soportadas'}</div>
        <div>Token: {token ? 'Configurado' : 'No configurado'}</div>
        <div>Usuario: {user ? user.nombre : 'No logueado'}</div>
      </div>
    )}

    <Router>
      <Routes>
        {/* Auth & Register*/}
        <Route path="/" element={<Login />} />
        <Route path="/crear-cuenta" element={<Register />} />
        <Route path="/verificar-correo" element={<VerificarCorreo />} />
        <Route path="/confirmar/:token" element={<Confirm />} />

        <Route path="/logout" element={<Logout />} />

        {/* Matches*/}

        <Route path="/ibento" element={<MainLayout />}>

          {/*Eventos*/}
          <Route path="eventos" element={<PrincipalEventos />} />
          <Route path="eventos/:eventId" element={<EventoPage />} />
          <Route path="busqueda" element={<Busqueda />} />
          <Route path="busqueda/:query" element={<BusquedaCategoria />} />

          <Route path="perfil" element={<Perfil />} />
          <Route path="editarPerfil" element={<EditarPerfil />} />
          <Route path="editarIntereses" element={<EditarIntereses />} />
          <Route path="verPerfil" element={<Perfiles />} />
          <Route path="favoritos" element={<Favoritos />} />
          <Route path="guardados" element={<Guardados />} />
          <Route path="matches" element={<BuscarMatches />} />
          <Route path="verMatches" element={<VerMatch />} />
          <Route path="itsMatch" element={<Matches />} />
          <Route path="match" element={<MisMatches />} />
          <Route path="verLike" element={<Like />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profileVerify" element={<PerfilCheck />} />
          <Route path="profileRepeat" element={<PerfilRepetido />} />

          {/* Recuperar Contraseña */}
          <Route path="recuperar-cuenta" element={<RecuperarContrasena />} />
          <Route path="recuperar-cuenta-codigo" element={<IngresarCodigo />} />
          <Route path="recuperar-cuenta-nueva-contrasena" element={<NuevaContrasena />} />

          <Route path="verificar" element={<VerificarPerfil />} />

        </Route>
      </Routes>
    </Router>
    <InstallPrompt />
    <NotificationManager />

  </div>
);
}

