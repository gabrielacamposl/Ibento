import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ibentoLogo from "/images/ibentoLogo.png";

export default function VerificarCorreo() {
  const colors = [
    "#a5b4fc", 
    "#c4b5fd", 
    "#fbcfe8", 
    "#f0abfc",
    "#f9a8d4",
    "#f3e8ff", 
    "#dbeafe", 
  ];

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="w-full min-h-screen bg-gradient-to-b bg-gradient-to-b from-blue-300 via-purple-300 to-white  relative">
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
            {/* Título */}
            <h1 className="text-2xl font-bold text-purple-800 mb-4 text-center tracking-tight">
              Confirma tu cuenta
            </h1>
            {/* Mensaje */}
            <div className="mb-6">
              <p className="text-center text-gray-700 font-medium mb-2">
                Revisa tu correo electrónico
              </p>
              <p className="text-center text-gray-600">
                <span>Para verificar tu cuenta, por favor revisa tu bandeja de entrada. Deberás recibir un mail de <span className="font-semibold">heyibento@gmail.com</span><br />
                </span>
                <span className="mt-2">**Si no encuentras el correo, revisa también tu carpeta de spam o correo no deseado.**</span>
              </p>
            </div>
            {/* Icono decorativo */}
            <div className="flex justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" className="w-16 h-16 text-purple-400">
                <rect width="48" height="48" rx="24" fill="#ede9fe" />
                <path stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 18l12 9 12-9" />
                <path stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 18V30a2 2 0 002 2h20a2 2 0 002-2V18" />
              </svg>
            </div>
            {/* Botón de regreso (opcional) */}
            
          </div>
        </div>
      </div>
    </div>
  );
}
