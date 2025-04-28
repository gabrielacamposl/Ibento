import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Container, CssBaseline, Typography, Grid} from "@mui/material";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext"; 
import { buttonStyle, inputStyles} from "../../../styles/styles";
import axios from "axios";

const colors = ["#FF00FF", "#00FFFF", "#FFFFFF"];

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post("http://localhost:8000/password-reset/request/", {email});
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar la solicitud.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      {/* Fondo para escritorio */}
      <motion.div className="hidden md:block relative w-full h-screen flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300"></div>
        <div className="absolute inset-0 z-10">
          {[...Array(9)].map((_, i) => {
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute w-40 h-40 opacity-30 blur-xl rounded-full"
                style={{ backgroundColor: color }}
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
            padding: 3,
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
            <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2 }}>
              Recuperar contraseña
            </Typography>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Grid item xs={12}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico<span className="text-red-500">*</span>
                </label>
                <InputText
                  className={inputStyles}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>

              {message && (
                <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                className={buttonStyle}
              >
                Enviar código
              </Button>
            </form>
          </Container>
        </Box>
      </motion.div>

      {/* Fondo para móviles */}
      <div className="block md:hidden w-full min-h-screen bg-gradient-to-b from-blue-300 via-purple-300 to-white relative">
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

        <div className="relative z-10 flex flex-col items-center pt-10 px-6 min-h-screen">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Recuperar contraseña</h1>

          <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico:</label>
                <InputText
                  className={inputStyles}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {message && (
                <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                className={buttonStyle}
              >
                Enviar código
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}