import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { motion } from "framer-motion";



export default function VerificarCorreo() {

  const colors = ["#FFFFFF"]; // "#FF00FF", "#00FFFF", Rosa y azul cielo


  return (

    <div className="h-screen flex justify-center items-center">
      {/* Formulario para la visualización web  */}

      <motion.div
        className="hidden md:block relative w-full h-screen flex justify-center items-center overflow-hidden "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 "></div>
        <div className="absolute inset-0 z-10">

          {/* Luces flotantes */}
          {[...Array(9)].map((_, i) => {
            const color = colors[i % colors.length]; // Alterna entre los 3 colores

            return (
              <motion.div
                key={i}
                className="absolute w-40 h-40 opacity-30 blur-xl rounded-full"
                style={{ backgroundColor: color }} // Aplica el color dinámicamente
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                  y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
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
        <Box
          sx={{
            height: "100vh",
            width: "100vw",

            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "background.default",
            padding: 2,
          }}
        >
          <Container
            component="main"
            maxWidth="xs"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "white",
              boxShadow: 3,
              p: 4,
              zIndex: 20,
              borderRadius: 2,
            }}
          >
            <CssBaseline />
            <Typography className="text-bold" variant="h5" component="h1" sx={{ textAlign: "center", mb: 2 }}>
            Confirma tu cuenta
            </Typography>
            <p className="text-center text-gray-700 mb-4">
            Para verificar tu cuenta, por favor revisa tu bandeja de entrada.
            En caso de no encontrar el correo, te recomendamos revisar también tu carpeta de spam o correo no deseado.
            </p>
          </Container>
        </Box>
      </motion.div>


      {/* Formulario para móviles */}

      <div className="block md:hidden w-full min-h-screen bg-gradient-to-b from-blue-300 via-purple-300  to-white relative">
        {/* Fondo degradado y luces */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(7)].map((_, i) => {
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute w-24 h-24 opacity-30 blur-2xl rounded-full"
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

        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center pt-10 px-6 min-h-screen">
          {/* Logo */}
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" />

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Confirma tu cuenta</h1>

          {/* Formulario */}
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
          
        <Grid container component="main" maxWidth="xs" className="w-full h-full">
          <CssBaseline />
          <Typography className="font-bold text-purple-800 text-center" variant="h6" component="h1" sx={{ mb: 2 }}>
            Revisa tu correo electrónico
          </Typography>
          <p className="text-center text-gray-700 mb-4">
            Para verificar tu cuenta, por favor revisa tu bandeja de entrada.
            En caso de no encontrar el correo, te recomendamos revisar también tu carpeta de spam o correo no deseado.
          </p>
        </Grid>
      
          </div>
        </div>
      </div>

      
    </div>


  );
}
