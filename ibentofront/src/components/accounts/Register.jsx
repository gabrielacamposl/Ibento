import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { buttonStyleCategoria, inputStyles, verifyStyle } from "../../styles/styles";
import Container from "@mui/material/Container";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import { buttonStyle, buttonAccept } from "../../styles/styles";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import axios from "../../axiosConfig";
import api from "../../api";

import ibentoLogo from "/images/ibentoLogo.png";

import { name_regex, email_regex, password_regex } from "../../utils/regex";
import apiaxios from "../../axiosConfig";

import Page from "./Terminos"

import "primereact/resources/themes/lara-light-indigo/theme.css";   
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";




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
  const requiredFields = ['nombre', 'apellido', 'email', 'password', 'confirmPassword'];

  // Seleccionar preferencias de eventos
  const [step, setStep] = useState(1); // 1 -> Registro, 2 -> Preferencias
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [disable, setDisable] = useState(false);
  const colors = ["#FFFFFF"]; // "#FF00FF", "#00FFFF", Rosa y azul cielo

  const [message, setMessage] = useState("");

  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  // Función para mostrar el diálogo
  const showDialog = () => {
    setVisible(true);
  };

  // Función para cerrar el diálogo
  const hideDialog = () => {
    setVisible(false);
  };

  // Footer personalizado para el diálogo
  const dialogFooter = (
    <div className="flex justify-between p-4">
      <Button
        label="Cancelar"
        className="p-button-outlined text-purple-800"
        onClick={hideDialog}
      />
      <Button
        label="Aceptar"
        // className="p-button-rounded text-white bg-purple-800"
        className={buttonAccept}
        onClick={() => {
          setChecked(true);
          hideDialog();
        }}
      />
    </div>
  );

  useEffect(() => {
    if (step === 2) {
      fetchCategorias(); // Cargar categorías si estamos en el paso 2
    }
  }, [step]);

  // Función para obtener categorías de eventos
  const fetchCategorias = async () => {
    try {
      const res = await apiaxios.get('eventos/categorias/');
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

    // Verificar si se han seleccionado preferencias
    if (selectedEvents.length === 0) {
      setMessage("Debes seleccionar al menos una preferencia de evento.");
      return;
    }
    if (selectedEvents.length < 3) {
      setMessage("Debes seleccionar como mínimo 3 preferencias de evento.");
      return;
    }

    // Validar que el correo no esté en uso

    // Los datos a enviar
    const data = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      preferencias_evento: selectedEvents, // Enviar preferencias seleccionadas
    };

    try {
      const res = await api.post('crear-cuenta/', data);

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

    <div className="flex justify-center items-center">
      {/* Formulario para la visualización web  */}
      <div className= " w-full  flex justify-center items-center bg-gradient-to-b from-blue-300 via-purple-300 to-white relative ">
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
                        <span style={{ fontSize: "12px" }} className={verifyStyle} onClick={() => setVisible(true)}>
                          He leído y acepto el
                          <span
                            className="mx-1 text-purple-600 cursor-pointer"
                          >
                           <strong>Términos y condiciones</strong>
                          </span>
                          {/* <Button className="font-bold " label="Aviso de privacidad" onClick={() => setVisible(true)} /> */}
                          y los <strong>Aviso de privacidad</strong>.
                        </span>
                      }
                    />
                  </div>

                  <div className="card flex justify-content-center">
                    <Dialog
                      visible={visible}
                      style={{ width: "90vw", maxWidth: "1000px" }}
                      onHide={hideDialog}
                      footer={dialogFooter}
                      draggable={false}
                      resizable={false}
                      className="p-1"
                      contentClassName="p-0"
                      header="Términos y condiciones"
                      headerClassName="bg-white border-none p-3"
                      closeIcon={<i className="pi pi-times text-gray-500 hover:text-gray-700" />}
                    >
                      <div className="dialog-content">
                        <Page />
                      </div>
                    </Dialog>
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
              {/* <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6 h-200 overflow-y-auto">
                <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2, fontWeight: "bold", color: "black" }}>
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

               

              </div> */}

                <div className="p-6 bg-white rounded-2xl">
                            <p className="text-gray-600 mb-4">¿Qué tipo de eventos te gustan?</p>
                            <div className="space-y-6">
                                {categorias.map((categoria) => (
                                    <div key={categoria.id} className="space-y-3">
                                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-lg">
                                            <h3 className="font-semibold text-purple-700">{categoria.nombre}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {categoria.valores.map((valor) => (
                                                <button
                                                    key={valor}
                                                    className={`px-4 py-2 rounded-full font-light transition-all duration-300 text-sm ${
                                                        selectedEvents.includes(valor)
                                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' 
                                                            : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                                                    }`}
                                                    onClick={() => toggleSeleccionado(valor)}
                                                >
                                                    {valor}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                             {/* <Button onClick={handleSubmit} className={buttonStyle} variant="contained" disabled={selectedEvents.length < 3}>
                  Crear Cuenta
                </Button> */}
                 <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-20">
                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Guardar Cambios
                    </button>
                </div>
                        </div>
            </>
          )}




        </div>
      </div>

      {/* Formulario para móviles
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
        
          <Box
            component="img"
            src={ibentoLogo}
            alt="Ibento Logo"
            sx={{ width: 80, height: "auto", mb: 2 }}
          />

          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear Cuenta</h1>

          
          {step === 1 && (
            <>
              <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
          
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

                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                    <InputText className={inputStyles} name="email" onChange={handleChange} required />
                  </div>

                 
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
                        <span style={{ fontSize: "12px" }} className={verifyStyle} onClick={() => setVisible(true)}>
                          He leído y acepto el
                          <span
                            className="mx-1 text-purple-600 cursor-pointer"
                          >
                           <strong>Términos y condiciones</strong>
                          </span>
                         
                          y los <strong>Aviso de privacidad</strong>.
                        </span>
                      }
                    />
                  </div>

                  <div className="card flex justify-content-center">
                    <Dialog
                      visible={visible}
                      style={{ width: "90vw", maxWidth: "1000px" }}
                      onHide={hideDialog}
                      footer={dialogFooter}
                      draggable={false}
                      resizable={false}
                      className="p-1"
                      contentClassName="p-0"
                      header="Términos y condiciones"
                      headerClassName="bg-white border-none p-3"
                      closeIcon={<i className="pi pi-times text-gray-500 hover:text-gray-700" />}
                    >
                      <div className="dialog-content">
                        <Page />
                      </div>
                    </Dialog>
                  </div>
                
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
                  
                </form>
              </div>
            </>)}
          {step === 2 && (
            <>
              <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6 h-200 overflow-y-auto">
                <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2, fontWeight: "bold", color: "black" }}>
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
      */}



    </div>


  );
}