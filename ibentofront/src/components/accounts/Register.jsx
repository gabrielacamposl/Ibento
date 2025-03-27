import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api";
import { InputText } from "primereact/inputtext";
import { inputStyles } from "../../styles/styles";
import Container from "@mui/material/Container";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button } from "primereact/button";
import { buttonStyle } from "../../styles/styles";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Grid2 } from "@mui/material";



export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const colors = ["#FFFFFF"]; // "#FF00FF", "#00FFFF", Rosa y azul cielo

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    console.log("Datos antes de enviar:", form);

    if (!isTermsAccepted) {
      setMessage("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await registerUser({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
      });

      console.log("Respuesta del servidor:", response);

      if (response.mensaje) {
        setMessage("Tu cuenta se ha creado correctamente, revisa tu correo para activar tu cuenta." + response.mensaje);
        setTimeout(() => navigate("/confirmar"), 2000);
      } else {
        setMessage("Error al registrar usuario");
      }
    } catch (error) {
      setMessage("Hubo un error en el servidor");
    }
  }

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
            <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2 }}>
              Crear Cuenta
            </Typography>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre<span className="text-red-500">*</span>
                  </label>
                  <InputText className={inputStyles} name="nombre" onChange={handleChange} required />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido<span className="text-red-500">*</span>
                  </label>
                  <InputText className={inputStyles} name="apellido" onChange={handleChange} required />
                </Grid>

                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Correo electrónico<span className="text-red-500">*</span>
                  </label>
                  <InputText className={inputStyles} name="email" onChange={handleChange} required />
                </Grid>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña<span className="text-red-500">*</span>
                  </label>
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
                </Grid>
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmar Contraseña<span className="text-red-500">*</span>
                  </label>
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
                </Grid>
                <Grid item xs={12}>
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
                      <span style={{ fontSize: "18px" }}>
                        He leído y acepto el <strong>Aviso de privacidad</strong> y los <strong>Términos y condiciones</strong>.
                      </span>
                    }
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                className={buttonStyle}
                variant="contained"
              >
                Siguiente
              </Button>

            </form>
          </Container>
        </Box>
      </motion.div>


      {/* Formulario para móviles */}
      <div className="block md:hidden">

        <div className="block md:hidden w-full h-screen flex flex-col">
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
          {/* Logo */}
          <img src="/logo.png" alt="Logo" className="w-16 h-16 z-20" />

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
            <Typography variant="h5" component="h1" className="text-center font-bold text-gray-700 mb-4">
              Crear Cuenta
            </Typography>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <InputText className={inputStyles} name="nombre" required />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <InputText className={inputStyles} name="apellido" required />
                </Grid>

                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <InputText className={inputStyles} name="email" required />
                </Grid>

                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <InputText
                      className={`${inputStyles} pr-10`}
                      type={showPassword ? "text" : "password"}
                      name="password"
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
                </Grid>

                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <div className="relative">
                    <InputText
                      className={`${inputStyles} pr-10`}
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox value="allowPrivTerm" color="primary" />}
                    label={
                      <span style={{ fontSize: "12px" }}>
                        He leído y acepto el <strong>Aviso de privacidad</strong> y los <strong>Términos y condiciones</strong>.
                      </span>
                    }
                  />

                </Grid>
              </Grid>

              {/* Botón de siguiente */}
              <Button type="submit" className={buttonStyle} variant="contained">
                Siguiente
              </Button>

              {/* Botón de Google */}
              {/* <Button variant="outlined" className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 rounded-full py-2 mt-2">
              <img src="/google-icon.png" alt="Google" className="w-6 h-6" />
              Iniciar con Google
            </Button> */}

            </form>
          </Grid>
        </Box>
      </div>
    </div>


  );
}
