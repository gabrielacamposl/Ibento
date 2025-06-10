import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Heart, Users, MessageCircle, Mail, Lock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import {
  FormControlLabel,
  Checkbox,
  Paper,
  Box,
  Grid,
  Typography,
  CssBaseline,
} from "@mui/material";
import { buttonStyle, inputStyles } from "../../styles/styles";
import api from '../../apilogin';
import InstallPrompt from "../../components/pwa/InstallPrompt";
import { initializePushNotifications } from '../../utils/pushNotifications';
import { motion } from "framer-motion";
import ibentoLogo from "/images/ibentoLogo.png";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const navigate = useNavigate();
  const toastRef = useRef(null);

  const colors = ["#FF00FF", "#00FFFF", "#FFFFFF", "#9333EA", "#3B82F6"];

  // Verificar soporte de notificaciones al cargar
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushEnabled(true);
    }
  }, []);

  const showToast = (message, type = 'info') => {
    // Crear toast personalizado
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warn' ? 'bg-yellow-500' : 'bg-blue-500';
    toast.className += ` ${bgColor}`;
    
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-black/70 hover:text-black">✕</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    
    // Auto-remove después de 4 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones básicas
    if (!email || !password) {
      showToast("Por favor completa todos los campos", 'warn');
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
          showToast("¡Notificaciones activadas! Recibirás alertas de matches, likes y mensajes", 'info');
        } catch (pushError) {
          console.warn("Error al activar notificaciones:", pushError);
          showToast("Login exitoso. Para recibir notificaciones, permite el acceso cuando te lo solicite el navegador", 'info');
        }
      }

      // Mostrar mensaje de éxito
      showToast("¡Inicio de sesión exitoso! Redirigiendo...", 'success');

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
      
      showToast(mensajeError, 'error');
    }
  };

  // Función para manejar la redirección a crear cuenta
  const handleCreateAccount = () => {
    navigate("/crear-cuenta");
  };

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
          {/* Tarjeta principal con glassmorphism */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-white/30 relative overflow-hidden">
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
                  src="/images/ibentoLogo.png"
                  alt="Ibento Logo"
                  className="w-20 h-auto"
                />
              </div>

              <h1 className="text-gray-800 font-bold text-2xl">
                Inicia sesión 
              </h1>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Correo electrónico <span className="text-pink-500">*</span>
                </label>
                <div className="relative group">
                  <InputText
                    className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-black/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    required
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Contraseña <span className="text-pink-500">*</span>
                </label>
                <div className="relative group">
                  <InputText
                    className="w-full pl-12 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-black/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    required
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              {/* Recordar cuenta y recuperar contraseña */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-gray-700 text-sm">Recordar cuenta</span>
                </label>
                <Link
                  to="/recuperar-cuenta"
                  className="text-sm text-purple-600 hover:text-purple-800 transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
              <div className="transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Button 
                   className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                  type="submit"
                  onClick={handleLogin}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>

            {/* Divisor */}
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
              <span className="px-4 text-gray-600 text-sm">o</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
            </div>

            {/* Crear cuenta */}
            <div className="text-center">
              <p className="text-gray-700 text-sm mb-4">
                ¿No tienes una cuenta?
              </p>
              <button
                onClick={handleCreateAccount}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Crear cuenta
              </button>
            </div>
          </div>

          {/* Características PWA */}
          <div className="mt-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-medium">App Móvil</span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                📱 ¡Instala la app para la mejor experiencia!
              </p>
              <p className="text-white/70 text-xs">
                Recibe notificaciones de matches, likes y mensajes al instante
              </p>
              {pushEnabled && (
                <div className="mt-2 text-green-300 text-xs">
                  ✓ Notificaciones push disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* InstallPrompt component */}
      <InstallPrompt />

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
};

export default Login;