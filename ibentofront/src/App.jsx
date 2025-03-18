import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Confirm from "./components/Confirm";
import Login from "./components/Login";
import Perfil from "./components/Perfil";
import EditarPerfil from "./components/EditarPerfil";
import EditarIntereses from "./components/Intereses";
import Perfiles from "./components/PerfilUsers";
import Favoritos from "./components/Favoritos";
import Guardados from "./components/Guardados";
import BuscarMatches from "./components/BuscarMatch";
import VerMatch from "./components/verMatches";
import Matches from "./components/itsMatch";
import MisMatches from "./components/matches";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/confirmar" element={<Confirm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/editarPerfil" element={<EditarPerfil />} />
        <Route path="/editarIntereses" element={<EditarIntereses />} />
        <Route path="/verPerfil" element={<Perfiles />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/guardados" element={<Guardados />} />
        <Route path="/matches" element={<BuscarMatches />} />
        <Route path="/verMatches" element={<VerMatch />} />
        <Route path="/itsMatch" element={<Matches />} />
        <Route path="/match" element={<MisMatches />} />
      </Routes>
    </Router>
  );
}
