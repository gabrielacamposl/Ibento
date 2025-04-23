import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./components/accounts/Register";
import Confirm from "./components/accounts/Confirm";
import Login from "./components/accounts/Login";
import LoginPrueba from "./components/accounts/loginprueba";
import Inicio from "./components/accounts/inicio";
import VerificarCorreo from "./components/accounts/VerificarCorreo";
import EventosPreferencias from "./components/preferences/EventosPreferencias";



import Perfil from "./components/usuario/Perfil";
import EditarPerfil from "./components/usuario/EditarPerfil";
import EditarIntereses from "./components/usuario/Intereses";
import Favoritos from "./components/usuario/Favoritos";
import Guardados from "./components/usuario/Guardados";
import VerificarPerfil from "./components/usuario/verificar";

import BuscarMatches from "./components/match/BuscarMatch";
import Perfiles from "./components/match/PerfilUsers";
import VerMatch from "./components/match/verMatches";
import Matches from "./components/match/itsMatch";
import MisMatches from "./components/match/matches";
import Like from "./components/match/verLike";
import Chat from "./components/match/chat";



import EventoPage from "./components/eventos/eventoPage";  
import PrincipalEventos from "./components/eventos/principalEventos";
import RecuperarContrasena from "./recuperarContrasena";
import IngresarCodigo from "./ingresarCodigo";
import NuevaContrasena from "./nuevaContrasena";  
import MainLayout from "./layouts/MainLayout";
import Busqueda  from "./components/eventos/busqueda";



export default function App() {
  return (
    <Router>
    <Routes>
      {/* Auth & Register*/}
      <Route path="/" element={<Login/>} />
      <Route path="/registrar" element={<Register />} />
      <Route path="/verificar-correo" element={<VerificarCorreo />} />
      <Route path="/confirmar/:token" element={<Confirm/>} />

      <Route path="/loginp" element={<LoginPrueba/>}/>
      <Route path="/inicio" element={<Inicio/>}/>
      
      {/* Preferencias del Usuario para sugerencia de Eventos*/}
      <Route path="/preferencias" element={<EventosPreferencias />} />

        {/* Matches*/}

        
        <Route path="/principal" element={<MainLayout />}>

          {/*Eventos*/}
          <Route path="eventos" element={<PrincipalEventos />}/>
          <Route path="eventos/:eventId" element={<EventoPage />} />
          <Route path="busqueda" element={<Busqueda />} />
          

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
          
          <Route path = "recuperarContraseÃ±a" element = {<RecuperarContrasena/>}/>
          <Route path="ingresarCodigo" element={<IngresarCodigo />} />
          <Route path="nuevaContrasena" element={<NuevaContrasena />} />
          <Route path="verificar" element={<VerificarPerfil />} />

        </Route>

        
      </Routes>
    </Router>
  );
}