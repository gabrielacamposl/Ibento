import { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from '../../apilogin';
import InstallPrompt from "../../components/pwa/InstallPrompt";
import { initializePushNotifications } from '../../utils/pushNotifications';
import {
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import { Button } from "primereact/button";
import { Eye, EyeOff, Heart, Users, MessageCircle, Bell } from "lucide-react";
import { motion } from "framer-motion";

// Simulamos el logo y estilos
const ibentoLogo = "/images/ibentoLogo.png";
const buttonStyle = "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105";
const inputStyles = "w-full p-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300";

const colors = ["#FF00FF", "#00FFFF", "#FFFFFF", "#9333EA", "#3B82F6"];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  // Verificar soporte de notificaciones al cargar
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushEnabled(true);
    }
  }, []);

  // Funciones para mostrar toasts
  const showSuccess = (message) => {
    toast.current?.show({severity:'success', summary: 'Éxito', detail: message, life: 4000});
  };

  const showError = (message) => {
    toast.current?.show({severity:'error', summary: 'Error', detail: message, life: 4000});
  };

  const showWarn = (message) => {
    toast.current?.show({severity:'warn', summary: 'Advertencia', detail: message, life: 4000});
  };

  const showInfo = (message) => {
    toast.current?.show({severity:'info', summary: 'Información', detail: message, life: 4000});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones básicas
    if (!email || !password) {
      showWarn("Por favor completa todos los campos");
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

      // Inicializar notificaciones push después del login exitoso
      if (pushEnabled) {
        try {
          await initializePushNotifications(res.data.id);
          showInfo("¡Notificaciones activadas! Recibirás alertas de matches, likes y mensajes");
        } catch (pushError) {
          console.warn("Error al activar notificaciones:", pushError);
          showInfo("Login exitoso. Para recibir notificaciones, permite el acceso cuando te lo solicite el navegador");
        }
      }

      // Mostrar mensaje de éxito
      showSuccess("¡Inicio de sesión exitoso! Redirigiendo...");

      // Redirigir al usuario después de un breve delay para que vea el toast
      setTimeout(() => {
        window.location.href = '/ibento/eventos';
      }, 1500);
      
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
      
      showError(mensajeError);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-300/30 via-transparent to-magenta-300/30"></div>
      </div>

      {/* Partículas flotantes mejoradas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => {
          const color = colors[i % colors.length];
          const size = Math.random() * 100 + 50;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20 blur-xl"
              style={{ 
                backgroundColor: color,
                width: size,
                height: size,
              }}
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                x: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                ],
                y: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                ],
                scale: [1, 1.2, 0.8, 1],
                opacity: [0.1, 0.3, 0.1, 0.2],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Tarjeta principal con glassmorphism */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 relative overflow-hidden">
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            
            {/* Logo y título */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img
                  src={ibentoLogo}
                  alt="Ibento Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <Typography 
                component="h1" 
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "Aptos, sans-serif" }}
              >
                ¡Bienvenido!
              </Typography>
              <p className="text-white/80 text-sm">
                Inicia sesión para conectar con personas increíbles
              </p>
            </motion.div>

            {/* Formulario */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Correo electrónico <span className="text-pink-300">*</span>
                </label>
                <div className="relative">
                  <InputText
                    className={`${inputStyles} pl-4`}
                    required
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Contraseña <span className="text-pink-300">*</span>
                </label>
                <div className="relative">
                  <InputText
                    className={`${inputStyles} pl-4 pr-12`}
                    required
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-purple-400 hover:text-purple-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Recordar cuenta y recuperar contraseña */}
              <div className="flex items-center justify-between">
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: 'white',
                        '&.Mui-checked': {
                          color: '#e879f9',
                        },
                      }}
                    />
                  }
                  label={
                    <span className="text-white/80 text-sm">Recordar cuenta</span>
                  }
                />
                <Link
                  to="/recuperar-cuenta"
                  className="text-sm text-pink-300 hover:text-pink-200 transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className={`${buttonStyle} w-full text-lg relative overflow-hidden`}
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Iniciar Sesión
                      </>
                    )}
                  </span>
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] animate-pulse"></div>
                </Button>
              </motion.div>
            </motion.form>

            {/* Divisor */}
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">o</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Crear cuenta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-white/80 text-sm mb-3">
                ¿No tienes una cuenta?
              </p>
              <Link
                to="/crear-cuenta"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Crear cuenta
              </Link>
            </motion.div>
          </div>

          {/* Características PWA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center space-y-2"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-medium">App Móvil</span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                📱 Instala la app para recibir notificaciones instantáneas de matches, likes y mensajes
              </p>
              {pushEnabled && (
                <div className="mt-2 text-green-300 text-xs">
                  ✓ Notificaciones push disponibles
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Toast component */}
      <Toast ref={toast} />
      
      {/* InstallPrompt component */}
      <InstallPrompt />
    </div>
  );
};

export default Login;