import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
/*import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase"; 
import 'primereact/resources/primereact.min.css';
import InstallPrompt from './components/pwa/InstallPrompt';
*/
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
import Busqueda  from "./components/eventos/busqueda";
import BusquedaCategoria from "./components/eventos/searchCategories";


//const VAPID_P = import.meta.env.VAPID_PUBLICA;


export default function App() {
/*
   useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          getToken(messaging, {
            vapidKey: VAPID_P
          })
            .then(currentToken => {
              if (currentToken) {
                console.log('[FCM Token]', currentToken);
                // Aquí puedes enviar el token a tu backend con fetch()
              } else {
                console.warn('No se obtuvo token FCM');
              }
            })
            .catch(err => {
              console.error('Error al obtener token FCM', err);
            });
        }
      });
    }
  }, []);
*/
  return (
    <>
    <Router>
    <Routes>
      {/* Auth & Register*/}
      <Route path="/" element={<Login/>} />
      <Route path="/crear-cuenta" element={<Register />} />
      <Route path="/verificar-correo" element={<VerificarCorreo />} />
      <Route path="/confirmar/:token" element={<Confirm/>} />

      <Route path="/logout" element={<Logout/>}/>
      
        {/* Matches*/}
        
        <Route path="/ibento" element={<MainLayout />}>

          {/*Eventos*/}
          <Route path="eventos" element={<PrincipalEventos />}/>
          <Route path="eventos/:eventId" element={<EventoPage />} />
          <Route path="busqueda" element={<Busqueda />} />
          <Route path ="busqueda/:query" element = {<BusquedaCategoria/>} />
        
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
          <Route path ="recuperar-cuenta" element = {<RecuperarContrasena/>}/>
          <Route path="recuperar-cuenta-codigo" element={<IngresarCodigo />} />
          <Route path="recuperar-cuenta-nueva-contrasena" element={<NuevaContrasena />} />

          <Route path="verificar" element={<VerificarPerfil />} />

        </Route>
      </Routes>
    </Router>
    {/* <InstallPrompt /> */}
    </>
  );
}