import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from '../../axiosConfig';
import axios from "axios";
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
import { email_regex, password_regex } from "../../utils/regex";


const colors = ["#FF00FF", "#00FFFF", "#FFFFFF"];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Validar campos

    // if (!email_regex.test(form.email) || !password_regex.test(form.password)) {
    //   setMessage("El correo electrónico o contraseña son incorrectos.");
    //   return;
    // }

    try {
      const res = await api.post("login/", { email, password });

      // Guardar tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      // Opcionalmente, guarda más datos del usuario
      localStorage.setItem("user", JSON.stringify({
        id: res.data.id,
        email: res.data.email,
        nombre: res.data.nombre,
      }));

      // Redirigir a vista principal
      // navigate("/principal/eventos");
      window.location.href = '/ibento/eventos';
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      const mensajeError = err.response?.data?.detail || "Correo o contraseña incorrectos";
      alert("Error al iniciar sesión: " + mensajeError);
    }
  };


  return (

    <div className="h-screen flex justify-center items-center">
      {/* Formulario para la visualización web  */}
      <div className="hidden md:block relative w-full h-screen flex justify-center items-center overflow-hidden ">
        <Grid container component="main" sx={{ height: "100vh", width: "100vw" }} className="hidden md:block relative w-full h-screen flex justify-center items-center overflow-hidden">
          <CssBaseline />
          {/* Animación */}
          <Grid item xs={false} sm={4} md={7} sx={{ position: "relative", overflow: "hidden" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg,rgba(136, 174, 255, 0.87) 0%,rgb(229, 152, 255) 100%)",
              }}
            />


            {[...Array(10)].map((_, i) => {
              const color = colors[i % colors.length];

              return (
                <motion.div
                  key={i}
                  className="absolute w-40 h-40 opacity-30 blur-2xl rounded-full"
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
                    duration: 10 + Math.random() * 5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </Grid>
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
        </Grid>
      </div>

      {/* Formulario para la visualización móvil */}
      <div className="block md:hidden relative w-full h-screen flex justify-center items-center overflow-hidden">
        {/* Fondo con degradado */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-400 via-purple-200 to-transparent z-0"></div>
 
        <div className="h-screen flex justify-center items-center bg-gray-100 relative z-10">
          <Grid container component="main" sx={{ height: "100vh", width: "100vw" }} className=" w-full  flex justify-center overflow-hidden">
            <Grid item xs={12} component={Paper} elevation={6} square sx={{ borderRadius: 4, p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Logo */}
                <Box component="img" src={ibentoLogo} alt="Ibento Logo" sx={{ width: 100, height: "auto", mb: 2 }} />

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
                      Correo electrónico<span className="text-red-500">*</span>
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
          </Grid>
        </div>
      </div>

    </div>

  );
};

export default Login;
