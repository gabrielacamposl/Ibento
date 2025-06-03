import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Container, CssBaseline, Typography, Grid } from "@mui/material";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { buttonStyle, inputStyles } from "../../../styles/styles";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import api from "../../../api";
import {password_regex } from "../../../utils/regex";

const colors = ["#FF00FF", "#00FFFF", "#FFFFFF"];

export default function PasswordResetChange() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const emailGuardado = localStorage.getItem("emailReset");
    if (!emailGuardado) {
      navigate("/recuperar-cuenta"); // si no hay email, redirige al inicio
      navigate("/recuperar-cuenta"); // si no hay email, redirige al inicio
    } else {
      setEmail(emailGuardado);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await api.post("password-reset/change/", {
      const response = await api.post("password-reset/change/", {
        email: email,
        new_password: password,
      });

      setMessage(response.data.message);

      // Limpia el email guardado
      localStorage.removeItem("emailReset");

      // Redirige al login después de cambiar la contraseña
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
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
              Cambiar Contraseña
            </Typography>

            <form className="space-y-4 w-full" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
              <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <InputText
                      className={`${inputStyles} pr-10`}
                      required
                      fullWidth
                      name="password"
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>

                </Grid>

                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <InputText
                      className={`${inputStyles} pr-10`}
                      required
                      fullWidth
                      name="passwordConfirm"
                      label="Confirmar contraseña"
                      type={showPasswordConfirm ? "text" : "password"}
                      id="passwordConfirm"
                      autoComplete="current-password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <div
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>

                </Grid>
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

              <Button type="submit" variant="contained" className={buttonStyle} style={{ marginTop: 16 }} onClick={()=>{
                if (!password_regex.test(form.password)) {
                        setMessage("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.");
                        return;
                      }
                    }
                    
                      }>
                Cambiar contraseña
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Cambiar Contraseña</h1>

          <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
            <form className="space-y-4 w-full" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <InputText
                      className={`${inputStyles} pr-10`}
                      required
                      fullWidth
                      name="password"
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>

                </Grid>

                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <InputText
                      className={`${inputStyles} pr-10`}
                      required
                      fullWidth
                      name="passwordConfirm"
                      label="Confirmar contraseña"
                      type={showPasswordConfirm ? "text" : "password"}
                      id="passwordConfirm"
                      autoComplete="current-password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <div
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>

                </Grid>
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

              <Button type="submit" variant="contained" className={buttonStyle} style={{ marginTop: 16 }} onClick={()=>{
                if (!password_regex.test(form.password)) {
                        setMessage("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.");
                        return;
                      }}}>
                Cambiar contraseña
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
