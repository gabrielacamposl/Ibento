import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from '../../apilogin';
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
        //email: res.data.email,
        //nombre: res.data.nombre,
      }));
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

      
      {/* Formulario para móviles */}
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
                <Box
                      component="img"
                      src={ibentoLogo}
                      alt="Ibento Logo"
                      sx={{ width: 80, height: "auto", mb: 2 }}
                    />
      
                {/* Título */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear Cuenta</h1>
      
                {/* Formulario */}
                {step === 1 && (
                  <>
                    <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
                      <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Nombre y Apellido */}
                        <div className="flex space-x-3">
                          <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                            <InputText className={inputStyles} name="nombre" onChange={handleChange} required />
                          </div>
                          <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido:</label>
                            <InputText className={inputStyles} name="apellido" onChange={handleChange} required />
                          </div>
                        </div>
      
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                          <InputText className={inputStyles} name="email" onChange={handleChange} required />
                        </div>
      
                        {/* Contraseña */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
                          <div className="relative">
                            <InputText
                              className={`${inputStyles} pr-10`}
                              type={showPassword ? "text" : "password"}
                              name="password"
                              onChange={handleChange}
                              required
                            />
                            
                            <button
                              type="button"
                              className="absolute inset-y-0 right-2 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                            </button>
                          </div>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.
                            </Typography>
                        </div>
      
                        {/* Confirmar Contraseña */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña:</label>
                          <div className="relative">
                            <InputText
                              className={`${inputStyles} pr-10`}
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              onChange={handleChange}
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-2 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Cambia el estado al hacer clic
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                            </button>
                          </div>
                        </div>
      
                        {/* Checkbox términos */}
                        <div className="flex items-start">
                          <FormControlLabel
                            control={
                              <Checkbox
                                value="allowPrivTerm"
                                color="primary"
                                checked={isTermsAccepted}
                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                              />
                            }
                            label={
                              <span style={{ fontSize: "12px" }} className={verifyStyle}>
                                He leído y acepto el <strong>Aviso de privacidad</strong> y los <strong>Términos y condiciones</strong>.
                              </span>
                            }
                          />
                        </div>
      
                        {/* Botón de Siguiente */}
                        {message && (
                          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                            {message}
                          </Typography>
                        )}
      
      
                        <Button
                          type="button"
                          onClick={() => {
                            // Validar que todos los campos estén llenos
                            for (const field of requiredFields) {
                              if (!form[field]) {
                                setMessage("Por favor completa todos los campos obligatorios.");
                                return;
                              }
                            }
      
                            // Validar campos
                            if (!name_regex.test(form.nombre)) {
                              setMessage("El nombre debe contener solo letras.");
                              return;
                            }
                            if (!name_regex.test(form.apellido)) {
                              setMessage("El apellido debe contener solo letras.");
                              return;
                            }
                            if (!email_regex.test(form.email)) {
                              setMessage("El correo electrónico no es válido.");
                              return;
                            }
                            if (!password_regex.test(form.password)) {
                              setMessage("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.");
                              return;
                            }
                            if (form.password !== form.confirmPassword) {
                              setMessage("Las contraseñas no coinciden");
                              return;
                            }
                            if (!isTermsAccepted) {
                              setMessage("Debes aceptar los términos y condiciones para continuar.");
                              return;
                            }
                            
                            // Si todas las validaciones pasan, avanzar al siguiente paso
                            setMessage(""); // Limpia el mensaje si todo está bien
                            setStep(2);
                          }} // Cambiar al paso 2
                          className={buttonStyle}
                          variant="contained"
                        >
                          Siguiente
                        </Button>
                        {/* Botón Google
                        <button
                          type="button"
                          className="flex items-center justify-center w-full border border-gray-300 text-gray-700 rounded-full py-2 mt-4"
                        >
                          <img src="/images/Google_G.png" alt="Google" className="w-6 h-6 mr-2" />
                          Iniciar con Google
                        </button> */}
                      </form>
                    </div>
                  </>)}
                {step === 2 && (
                  <>
                    <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6 h-200 overflow-y-auto">
                      <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}>
                        ¿Qué tipo de eventos te gustan?
                      </Typography>
      
                      <Grid container spacing={2}>
                        <div className="intereses-container">
                          {categorias.map((categoria) => (
                            <div key={categoria.id} className="categoria mb-5">
                              <div className={buttonStyleCategoria} style={{ cursor: 'default' }}>
                                {categoria.nombre}
                              </div>
                              <ul className="flex flex-wrap">
                                {categoria.valores.map((valor) => (
                                  <li
                                    key={valor}
                                    className={`cursor-pointer mt-2 text-center px-4 py-1 ml-2 rounded-full font-medium transition ${selectedEvents.includes(valor)
                                      ? 'bg-purple-400 text-white shadow border-2 border-white'
                                      : 'btn-off'
                                      }`}
                                    onClick={() => toggleSeleccionado(valor)}
                                  >
                                    {valor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </Grid>
      
                      <Button onClick={handleSubmit} className={buttonStyle} variant="contained" disabled={selectedEvents.length < 3}>
                        Crear Cuenta
                      </Button>
      
                    </div>
                  </>
                )}
      
      
      
      
              </div>
            </div>

    </div>

  );
};

export default Login;
