import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api";
import api from '../../axiosConfig';
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
import axios from "axios";
import ibentoLogo from "/images/ibentoLogo.png";


export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferencias_evento: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Seleccionar preferencias de eventos
  const [step, setStep] = useState(1); // 1 -> Registro, 2 -> Preferencias
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [disable , setDisable] = useState(false);
  const colors = ["#FFFFFF"]; // "#FF00FF", "#00FFFF", Rosa y azul cielo

  const [message, setMessage] = useState("");


  useEffect(() => {
    if (step === 2) {
      fetchCategorias(); // Cargar categorías si estamos en el paso 2
    }
  }, [step]);

  // Función para obtener categorías de eventos
  const fetchCategorias = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/categorias/');
      const categoriasFormateadas = res.data.map(cat => ({
        id: cat._id,
        nombre: cat.nombre,
        valores: cat.subcategorias.map(sub => sub.nombre_subcategoria),
      }));
      setCategorias(categoriasFormateadas);
    } catch (err) {
      console.error('Error al obtener categorías:', err);
    }
  };

  // Función para manejar cambios en los campos del formulario
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Función para manejar la selección y deselección de eventos
  const toggleSeleccionado = (valor) => {
    setSelectedEvents((prevSelected) => {
      if (prevSelected.includes(valor)) {
        // Si el valor ya está seleccionado, lo quitamos
        return prevSelected.filter((item) => item !== valor);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prevSelected, valor];
      }
    });
  };

  // Función para manejar el submit del formulario
  async function handleSubmit(e) {
    e.preventDefault();

    // Verificar si los términos están aceptados
    if (!isTermsAccepted) {
        setMessage("Debes aceptar los términos y condiciones para continuar.");
        return;
    }

    // Verificar si las contraseñas coinciden
    if (form.password !== form.confirmPassword) {
        setMessage("Las contraseñas no coinciden");
        return;
    }

    // Los datos a enviar
    const data = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        preferencias_evento: selectedEvents, // Enviar preferencias seleccionadas
    };

    try {
        const res = await axios.post('http://localhost:8000/api/crear-cuenta/', data);

        if (res.data.mensaje) {
            setMessage("Tu cuenta se ha creado correctamente, revisa tu correo para activar tu cuenta. " + res.data.mensaje);

            setTimeout(() => navigate("/verificar-correo"), 2000);
        } else {
            setMessage("Error al registrar usuario");
        }

    } catch (err) {
        console.error("Error en la creación de cuenta:", err);
        const mensajeError = err.response?.data?.mensaje || 'Hubo un error en el servidor';
        setMessage("Error creando cuenta: " + mensajeError);
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
            {step === 1 && (
              <> 
            <Typography component="h1" variant="h5" sx={{ mt: 2, fontFamily: "Aptos, sans-serif", fontWeight: "bold" }}>
                Crear Cuenta
              </Typography>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex justify-center">
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre<span className="text-red-500">*</span>
                  </label>
                  <InputText className={inputStyles} name="nombre" onChange={handleChange} required />
                </Grid>
              </div>
              <div className="flex justify-center">
                <Grid item xs={12} >
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido<span className="text-red-500">*</span>
                  </label>
                  <InputText className={inputStyles} name="apellido" onChange={handleChange} required />
                </Grid>
              </div>
              <div className="flex justify-center">
                <Grid item xs={12}>
                  <label className="block text-sm font-medium text-gray-700">
                    Correo electrónico<span className="text-red-500">*</span>
                  </label>
                  <InputText className={inputStyles} name="email" onChange={handleChange} required />
                </Grid>
              </div>
              <div className="flex justify-center">
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
              </div>

              <div className="flex justify-center">
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
              </div>

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

              <Button
                    type="button"
                    onClick={() => setStep(2)} // Cambiar al paso 2
                    className={buttonStyle}
                    variant="contained"
                  >
                    Siguiente
                  </Button>

            </form>
            </>)}
            {step === 2 && (
              <>
                <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}>
                  ¿Qué tipo de eventos te gustan?
                </Typography>

                <Grid container spacing={2}>
                  <div className="intereses-container">
                    {categorias.map((categoria) => (
                      <div key={categoria.id} className="categoria mb-5">
                        <div className={buttonStyle} style={{ cursor: 'default' }}>
                          {categoria.nombre}
                        </div>
                        <ul className="flex flex-wrap">
                          {categoria.valores.map((valor) => (
                            <li
                              key={valor}
                              className={`cursor-pointer mt-2 text-center px-4 py-1 ml-2 rounded-full font-medium transition ${
                                selectedEvents.includes(valor)
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

                <Button onClick={handleSubmit} className={buttonStyle} variant="contained">
                  Crear Cuenta
                </Button>
              </>
            )}
          </Container>
        </Box>
      </motion.div>



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
                    <span style={{ fontSize: "18px" }}>
                      He leído y acepto el <strong>Aviso de privacidad</strong> y los <strong>Términos y condiciones</strong>.
                    </span>
                  }
                />
              </div>

              {/* Botón de Siguiente */}

              <Button
                    type="button"
                    onClick={() => setStep(2)} // Cambiar al paso 2
                    className={buttonStyle}
                    variant="contained"
                  >
                    Siguiente
                  </Button>

              {/* Botón Google */}
              <button
                type="button"
                className="flex items-center justify-center w-full border border-gray-300 text-gray-700 rounded-full py-2 mt-4"
              >
                <img src="/google-icon.png" alt="Google" className="w-6 h-6 mr-2" />
                Iniciar con Google
              </button>
            </form>
          </div>
          </>)}
          {step === 2 && (
              <>
              <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
                <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}>
                  ¿Qué tipo de eventos te gustan?
                </Typography>

                <Grid container spacing={2}>
                  <div className="intereses-container">
                    {categorias.map((categoria) => (
                      <div key={categoria.id} className="categoria mb-5">
                        <div className={buttonStyle} style={{ cursor: 'default' }}>
                          {categoria.nombre}
                        </div>
                        <ul className="flex flex-wrap">
                          {categoria.valores.map((valor) => (
                            <li
                              key={valor}
                              className={`cursor-pointer mt-2 text-center px-4 py-1 ml-2 rounded-full font-medium transition ${
                                selectedEvents.includes(valor)
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

                <Button onClick={handleSubmit} className={buttonStyle} variant="contained">
                  Crear Cuenta
                </Button>
                
                </div>
              </>
            )}
          

          

        </div>
      </div>



    </div>


  );
}