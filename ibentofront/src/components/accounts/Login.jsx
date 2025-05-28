
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from '../../apilogin';
import {
  FormControlLabel,
  Checkbox,
  Paper,
  Box,
  Grid,
  Typography,
  CssBaseline,
} from "@mui/material";
import { Button } from "primereact/button";
import { buttonStyle, inputStyles } from "../../styles/styles";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import ibentoLogo from "/images/ibentoLogo.png";



const colors = ["#FF00FF", "#00FFFF", "#FFFFFF"];


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

   const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validaciones básicas
    if (!email || !password) {
      setMessage("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("login/", { 
        email: email.trim(), 
        password: password 
      });

      // Limpiar cualquier sesión anterior
      localStorage.clear();
      
      // Guardar nuevos tokens y datos del usuario
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify({
        id: res.data.id,
        email: res.data.email,
        nombre: res.data.nombre,
      }));

      // Opcional: Guardar timestamp del login para debugging
      localStorage.setItem("login_time", new Date().toISOString());

      // Redirigir al usuario
      window.location.href = '/ibento/eventos';
      
    } catch (err) {
      setLoading(false);
      console.error("Error al iniciar sesión:", err);
      
      // Manejo específico de errores del backend
      let mensajeError = "Error al iniciar sesión";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Errores específicos de tu serializer
        if (typeof errorData === 'string') {
          mensajeError = errorData;
        } else if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.non_field_errors) {
          mensajeError = errorData.non_field_errors[0];
        } else if (errorData.email) {
          mensajeError = "Email: " + errorData.email[0];
        } else if (errorData.password) {
          mensajeError = "Contraseña: " + errorData.password[0];
        } else {
          // Para errores de validación custom de tu LoginSerializer
          mensajeError = Object.values(errorData)[0];
        }
      } else if (err.request) {
        // Error de red
        mensajeError = "Error de conexión. Verifica tu internet.";
      }
      
      setMessage(mensajeError);
    }
  };


  return (

    <div className="h-screen flex justify-center items-center">
      {/* Formulario para la visualización web  */}
      <div className="hidden md:block  w-full h-screen flex justify-center items-center bg-gradient-to-b from-blue-300 via-purple-300 to-white relative ">
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
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={ibentoLogo}
                alt="Ibento Logo"
                sx={{ width: 80, height: "auto", mb: 2 }}
              />
              <Typography component="h1" variant="h5" sx={{ mt: 2, fontFamily: "Aptos, sans-serif", fontWeight: "bold" }}>
                Inicia Sesión
              </Typography>
              <Box component="form" sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Correo electrónico<span className="text-red-500">*</span>
                  </label>
                  <InputText
                    className={`${inputStyles} pr-10`}
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                </Grid>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña<span className="text-red-500">*</span>
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
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                </Grid>

                <Grid item xs={12} container justifyContent="left" alignItems="left">

                  <Link to="/ibento/recuperar-cuenta" variant="body2" sx={{ fontStyle: "italic", color: "rgb(145, 64, 192)", fontSize: 15 }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Grid>


                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Recordar cuenta"
                  sx={{ "& .MuiTypography-root": { fontSize: "0.8rem" } }}
                />

                <Button className={buttonStyle} type="submit"
                  fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                  onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item xs={12} container justifyContent="center" alignItems="center">

                    <Link
                      to="/crear-cuenta"
                      component="button"
                      variant="body2" sx={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "rgb(129, 45, 177)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          color: "rgb(164, 96, 203)",
                        },
                      }}>
                      Crear cuenta
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </div>
      </div>

      
      {/* Formulario para móviles */}
      <div className="block md:hidden w-full min-h-screen bg-gradient-to-b from-blue-300 via-purple-300 to-white relative">
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
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={ibentoLogo}
                alt="Ibento Logo"
                sx={{ width: 80, height: "auto", mb: 2 }}
              />
              <Typography component="h1" variant="h5" sx={{ mt: 2, fontFamily: "Aptos, sans-serif", fontWeight: "bold" }}>
                Inicia Sesión
              </Typography>
              <Box component="form" sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Correo electrónico<span className="text-red-500">*</span>
                  </label>
                  <InputText
                    className={`${inputStyles} pr-10`}
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                </Grid>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña<span className="text-red-500">*</span>
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
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                </Grid>

                <Grid item xs={12} container justifyContent="left" alignItems="left">

                  <Link to="/ibento/recuperar-cuenta" variant="body2" sx={{ fontStyle: "italic", color: "rgb(145, 64, 192)", fontSize: 15 }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Grid>


                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Recordar cuenta"
                  sx={{ "& .MuiTypography-root": { fontSize: "0.8rem" } }}
                />

                <Button className={buttonStyle} type="submit"
                  fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                  onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item xs={12} container justifyContent="center" alignItems="center">

                    <Link
                      to="/crear-cuenta"
                      component="button"
                      variant="body2" sx={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "rgb(129, 45, 177)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          color: "rgb(164, 96, 203)",
                        },
                      }}>
                      Crear cuenta
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </div>
      </div>

    </div>

  );
};

export default Login;
