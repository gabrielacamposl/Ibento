import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
    if (isConfirmed) return;

    const confirmarCuenta = async () => {
      try {
        // Hacemos la llamada al backend para confirmar el token
        const response = await axios.get(`http://127.0.0.1:8000/api/confirmar/${token}/`);

        if (response.data.success) {
          setEstado("exito");
          setIsConfirmed(true); // Marcamos que ya se confirmó
        } else {
          // Si la respuesta del backend indica que la confirmación falló
          setEstado("error");
          setMensaje("El enlace de confirmación es inválido o ha expirado.");
        }
      } catch (error) {
        // Si hubo un error en la comunicación con el backend
        setEstado("exito");
        setMensaje("Hubo un error al intentar confirmar tu cuenta.");
      }
    };

    confirmarCuenta();
  }, [token, isConfirmed]); // Dependencia para controlar si ya se confirmó


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
            {estado === "verificando" && (
              <>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Verificando cuenta...</Typography>
              </>
            )}
            {estado === "exito" && (
               <div>
               <Typography className="text-center text-bold w-full flex justify-center items-center" variant="h5" color="black">
               ¡Tu cuenta ha sido verificada con éxito!
               
               </Typography>
               <img src="/nutria.png" alt="nutria jsjs" className="nutria" />
               </div>
            )}
            {/* Mensaje de error o éxito */}
            {estado === "error" && (
             
              <div>
              <Typography className="text-center text-bold w-full flex justify-center items-center" variant="h5" color="error">
                 Algo salió mal. {mensaje}
              </Typography>
              <img src="/nutriaTiste.png" alt="nutria jsjs" className="nutria2" />
              </div>
            )}

            <Button className={buttonStyle} type="submit" 
                fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                onClick={() => navigate("/")}> Inicia Sesión </Button>
          </Container>
        </Box>
      </motion.div>

      {/* Formulario para móviles */}
      <div className="block md:hidden">
        <div className="block md:hidden w-full h-screen flex flex-col items-center justify-center relative overflow-hidden ">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-300 via-purple-300 to-transparent z-10"></div>
          <div className="absolute inset-0 z-10">
            {[...Array(9)].map((_, i) => {
              const color = colors[i % colors.length]; // Alterna entre colores
              return (
                <motion.div
                  key={i}
                  className="absolute w-30 h-30 opacity-30 blur-xl rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight / 2, // Solo en la parte superior
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
     
       

        </div>

        {/* Contenedor del formulario */}
        <Box
          className="bg-white rounded-t-3xl shadow-lg flex justify-center items-start p-6"
          sx={{
            width: "100%",
            zIndex: 10,
          }}
        >
          <Grid container component="main" maxWidth="xs" className="w-full h-full">
            <CssBaseline />
            {estado === "verificando" && (
              <>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Verificando cuenta...</Typography>
              </>
            )}
            {estado === "exito" && (
               <div>
               <Typography className="text-center text-bold w-full flex justify-center items-center" variant="h5" color="black">
               ¡Tu cuenta ha sido verificada con éxito!
               
               </Typography>
               <img src="/nutria.png" alt="nutria jsjs" className="nutria" />
               </div>
            )}
            {/* Mensaje de error o éxito */}
            {estado === "error" && (
             
              <div>
              <Typography className="text-center text-bold w-full flex justify-center items-center" variant="h5" color="error">
                 Algo salió mal. {mensaje}
              </Typography>
              <img src="/nutriaTiste.png" alt="nutria jsjs" className="nutria2" />
              </div>
            )}
            <Button className={buttonStyle} type="submit" 
                fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                onClick={() => navigate("/")}> Inicia Sesión </Button>
          </Grid>
        </Box>
      </div>
    </div>
  );
}