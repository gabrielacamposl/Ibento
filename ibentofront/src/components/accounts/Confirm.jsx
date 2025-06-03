import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import Container from "@mui/material/Container";
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { Box, Typography, CircularProgress } from "@mui/material";
import { Button } from "primereact/button";
import { buttonStyle } from "../../styles/styles";
import { motion } from "framer-motion";
import "../../assets/css/mascota.css";
export default function Confirm() {
 
  const { token } = useParams();
  const [estado, setEstado] = useState("verificando"); // 'verificando' | 'exito' | 'error'
  const [mensaje, setMensaje] = useState("");  // Mensaje de error o éxito
  const [isConfirmed, setIsConfirmed] = useState(false); // Estado para saber si la cuenta ya fue confirmada
  const navigate = useNavigate();
  const colors = ["#FF00FF", "#00FFFF", "#FFFFFF"];


  useEffect(() => {
    // Evitar hacer la petición si ya fue confirmada
    const confirmarCuenta = async () => {
      if (isConfirmed) {return};
      try {
        // Hacemos la llamada al backend para confirmar el token
        const response = await api.get(`confirmar/${token}/`);
      
        if (response.status === 200) {
          console.log("ENTRE PRIMERO EN EXITO");
          setEstado("exito");
          setIsConfirmed(true); // Marcamos que ya se confirmó
        } else {
          // Si la respuesta del backend indica que la confirmación falló
          console.log("ENTRE PRIMERO EN ELSE");
          setEstado("error");
          setMensaje("El enlace de confirmación es inválido o ha expirado.");
        }
      } catch (error) {
        // Si hubo un error en la comunicación con el backend
        console.log("ENTRE EN ERROR");
        setEstado("exito");
        setMensaje("Felicidades! Eres un nuevo usuario de Ibento!");
      }
    };

    confirmarCuenta();
  }, [token, isConfirmed]); // Dependencia para controlar si ya se confirmó


  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="w-full min-h-screen bg-gradient-to-b from-blue-100 via-purple-100 to-white relative">
        {/* Fondo degradado y luces animadas */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(7)].map((_, i) => {
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute w-32 h-32 opacity-30 blur-3xl rounded-full"
                style={{ backgroundColor: color }}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight / 2,
                }}
                animate={{
                  x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                  y: [Math.random() * window.innerHeight / 2, Math.random() * window.innerHeight / 2],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col items-center pt-10 px-6 min-h-screen">
          {/* Logo */}
          <img
            src={ibentoLogo}
            alt="Ibento Logo"
            className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-lg"
          />

          {/* Card principal */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/30 mt-4">
            {/* Estado: verificando */}
            {estado === "verificando" && (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="#a78bfa" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <h2 className="text-lg font-semibold text-purple-700 mb-2">Verificando cuenta...</h2>
              </div>
            )}
            {/* Estado: éxito */}
            {estado === "exito" && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-green-700 mb-2 text-center">
                  ¡Tu cuenta ha sido verificada con éxito!
                </h2>
                <img src="/Chimmy.webp" alt="nutria feliz" className="w-20 h-20 mb-2" />
                {mensaje && (
                  <p className="text-center text-gray-700">{mensaje}</p>
                )}
              </div>
            )}
            {/* Estado: error */}
            {estado === "error" && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-red-600 mb-2 text-center">
                  Algo salió mal. {mensaje}
                </h2>
               
              </div>
            )}
            {/* Botón de regreso */}
            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-2 rounded-xl shadow-md hover:scale-105 transition-all duration-300"
            >
              Inicia Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}