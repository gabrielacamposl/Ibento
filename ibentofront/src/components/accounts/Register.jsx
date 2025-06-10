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
import { Eye, EyeOff, User, Mail, Lock, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

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
  const colors = ["#FF00FF", "#00FFFF", "#FFFFFF", "#9333EA", "#3B82F6"];

  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    // Verificar si se han seleccionado preferencias
    if (selectedEvents.length === 0) {
      setMessage("Debes seleccionar al menos una preferencia de evento.");
      setLoading(false);
      return;
    }
    if (selectedEvents.length < 3) {
      setMessage("Debes seleccionar como mínimo 3 preferencias de evento.");
      setLoading(false);
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
      setLoading(false);
    }
  }

  // Animación de partículas
  const AnimatedParticle = ({ index }) => {
    const color = colors[index % colors.length];
    const size = Math.random() * 100 + 50;
    const duration = 15 + Math.random() * 10;
    
    return (
      <div
        className="absolute rounded-full opacity-20 blur-xl animate-pulse"
        style={{
          backgroundColor: color,
          width: size + 'px',
          height: size + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDuration: duration + 's',
          animationDelay: Math.random() * 5 + 's',
        }}
      />
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500">
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400/30 via-transparent to-magenta-400/30"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <AnimatedParticle key={i} index={i} />
        ))}
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md transform transition-all duration-700 hover:scale-105">
          
          {step === 1 && (
            <>
              {/* Tarjeta principal con glassmorphism */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 relative overflow-hidden">
                {/* Efecto de brillo superior */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}></div>
                
                {/* Logo y título */}
                <div className="text-center items-center mb-8 relative z-10">
                  <div className="flex justify-center items-center mb-4">
                    <img
                      src={ibentoLogo}
                      alt="Ibento Logo"
                      className="w-20 h-auto"
                    />
                  </div>
                  <h1 className="text-gray-800 font-bold text-2xl">
                    Crear Cuenta
                  </h1>
                </div>

                {/* Formulario */}
                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                  {/* Nombre y Apellido */}
                  <div className="flex space-x-3">
                    <div className="w-1/2 space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        Nombre <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative group">
                        <InputText 
                          className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500" 
                          name="nombre" 
                          onChange={handleChange} 
                          placeholder="Tu nombre"
                          required 
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2 space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        Apellido <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative group">
                        <InputText 
                          className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500" 
                          name="apellido" 
                          onChange={handleChange} 
                          placeholder="Tu apellido"
                          required 
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Correo electrónico <span className="text-pink-500">*</span>
                    </label>
                    <div className="relative group">
                      <InputText 
                        className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500" 
                        name="email" 
                        type="email"
                        onChange={handleChange} 
                        placeholder="tu@email.com"
                        required 
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Contraseña <span className="text-pink-500">*</span>
                    </label>
                    <div className="relative group">
                      <InputText
                        className="w-full pl-10 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        onChange={handleChange}
                        placeholder="Tu contraseña"
                        required
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                      </div>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-purple-500 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Mínimo 8 caracteres, una mayúscula y un número
                    </p>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Confirmar Contraseña <span className="text-pink-500">*</span>
                    </label>
                    <div className="relative group">
                      <InputText
                        className="w-full pl-10 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        onChange={handleChange}
                        placeholder="Confirma tu contraseña"
                        required
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                      </div>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-purple-500 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox términos */}
                  <div className="flex items-start space-x-3">
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="allowPrivTerm"
                          color="primary"
                          checked={isTermsAccepted}
                          onChange={(e) => setIsTermsAccepted(e.target.checked)}
                          sx={{
                            '&.Mui-checked': {
                              color: '#9333EA',
                            },
                          }}
                        />
                      }
                    />
                    <span className="text-xs text-gray-700 leading-relaxed cursor-pointer" onClick={() => setVisible(true)}>
                      He leído y acepto los
                      <span className="mx-1 text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                        Términos y condiciones
                      </span>
                      y el <strong>Aviso de privacidad</strong>.
                    </span>
                  </div>

                  {/* Dialog */}
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

                  {/* Mensaje de error */}
                  {message && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <p className="text-red-600 text-sm">{message}</p>
                    </div>
                  )}

                  {/* Botón de Siguiente */}
                  <div className="transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
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
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                    >
                      Siguiente
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Paso 2: Preferencias */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 relative overflow-hidden">
                {/* Efecto de brillo superior */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}></div>

                {/* Título */}
                <div className="text-center mb-8 relative z-10">
                  <div className="flex justify-center items-center mb-4">
                    <Heart className="w-8 h-8 text-purple-500 mr-2" />
                    <Users className="w-8 h-8 text-pink-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Casi listo!</h2>
                  <p className="text-gray-600">¿Qué tipo de eventos te emocionan?</p>
                  <p className="text-sm text-purple-600 mt-2">Selecciona al menos 3 preferencias</p>
                </div>

                <div className="space-y-6 relative z-10 max-h-96 overflow-y-auto">
                  {categorias.map((categoria) => (
                    <div key={categoria.id} className="space-y-3">
                      <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40">
                        <h3 className="font-semibold text-purple-700 flex items-center">
                          <Heart className="w-4 h-4 mr-2" />
                          {categoria.nombre}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(categoria.valores)].map((valor) => (
                          <button
                            key={valor}
                            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm border ${
                              selectedEvents.includes(valor)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105 border-transparent'
                                : 'bg-white/70 text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-purple-200 hover:border-purple-300 backdrop-blur-sm'
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

                {/* Contador de selecciones */}
                <div className="mt-6 text-center relative z-10">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200/50">
                    <p className="text-sm text-gray-600">
                      Has seleccionado <span className="font-bold text-purple-600">{selectedEvents.length}</span> preferencias
                      {selectedEvents.length < 3 && (
                        <span className="text-red-500 ml-1">(mínimo 3)</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Mensaje de error */}
                {message && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center relative z-10">
                    <p className="text-red-600 text-sm">{message}</p>
                  </div>
                )}

                {/* Botón de crear cuenta */}
                <div className="mt-6 transform transition-transform hover:scale-[1.02] active:scale-[0.98] relative z-10">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                    onClick={handleSubmit} 
                    loading={loading}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center w-full">
                      {loading ? 'Creando tu cuenta...' : '🎉 Crear mi cuenta'}
                    </div>
                  </Button>            
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}