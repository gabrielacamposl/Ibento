import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Inicio() {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    const refresh = localStorage.getItem("refresh");
    const access = localStorage.getItem("access");

    try {
      await axios.post(
        "http://localhost:8000/api/logout_usuario/",
        { refresh },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión");
    }
  };

  return (
    <div>
      <h2>Bienvenido a Inicio</h2>
      <button onClick={cerrarSesion}>Cerrar sesión</button>
    </div>
  );
}

export default Inicio;
