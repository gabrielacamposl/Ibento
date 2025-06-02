import { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from '../../apilogin';
import { Button } from "primereact/button";
import { buttonStyle, inputStylesGlass, buttonStyleSecondary } from "../../styles/styles";
import { Eye, EyeOff, Heart, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ibentoLogo from "/images/ibentoLogo.png";

const colors = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"];

// Componente de partículas flotantes
const FloatingParticle = ({ delay = 0, duration = 3, className = "" }) => (
  <motion.div
    className={`absolute opacity-60 ${className}`}
    initial={{ y: 100, opacity: 0 }}
    animate={{ 
      y: -20, 
      opacity: [0, 1, 0],
      x: [0, 30, -30, 0],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm" />
  </motion.div>
);

const LoginClean = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundCircles, setBackgroundCircles] = useState([]);
  const navigate = useNavigate();
  const toast = useRef(null);

  // Funciones para mostrar toasts
  const showSuccess = (message) => {
    toast.current.show({severity:'success', summary: 'Éxito', detail: message, life: 4000});
  };

  const showError = (message) => {
    toast.current.show({severity:'error', summary: 'Error', detail: message, life: 4000});
  };

  const showWarn = (message) => {
    toast.current.show({severity:'warn', summary: 'Advertencia', detail: message, life: 4000});
  };

  // Función para crear círculos interactivos en el fondo
  const createBackgroundCircle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newCircle = {
      id: Date.now(),
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    setBackgroundCircles(prev => [...prev, newCircle]);
    
    // Remover el círculo después de la animación
    setTimeout(() => {
      setBackgroundCircles(prev => prev.filter(circle => circle.id !== newCircle.id));
    }, 2000);
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
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden cursor-pointer"
      onClick={createBackgroundCircle}
    >
      {/* Fondo animado con colores más intensos */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200">
        <div className="absolute inset-0 opacity-60">
          {[...Array(15)].map((_, i) => {
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute rounded-full blur-2xl"
                style={{ 
                  backgroundColor: color,
                  width: Math.random() * 500 + 300,
                  height: Math.random() * 500 + 300,
                }}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                }}
                animate={{
                  x: [
                    Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920), 
                    Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                    Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)
                  ],
                  y: [
                    Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080), 
                    Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                    Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)
                  ],
                }}
                transition={{
                  duration: 20 + Math.random() * 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
        
        {/* Círculos interactivos */}
        <AnimatePresence>
          {backgroundCircles.map((circle) => (
            <motion.div
              key={circle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                backgroundColor: circle.color,
                left: circle.x - 50,
                top: circle.y - 50,
              }}
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{ 
                width: 200, 
                height: 200, 
                opacity: 0 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
        
        {/* Capa adicional de color para mayor intensidad */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-300/40 via-blue-300/40 to-pink-300/40"></div>
      </div>

      {/* Partículas flotantes decorativas */}
      {[...Array(8)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.5} duration={3 + i * 0.3} />
      ))}

      {/* Contenedor principal */}
      <motion.div 
        className="relative z-10 w-full max-w-md mx-4 pointer-events-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card principal con glassmorphism */}
        <div className="glass-premium bg-white/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/30">
          {/* Logo con animación */}
          <motion.div 
            className="text-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative inline-block">
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
              <img 
                src={ibentoLogo} 
                alt="Ibento Logo" 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="title-section text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold">
              Bienvenido a Ibento
            </h1>
            <p className="body-text text-gray-600 mt-2">Inicia sesión para descubrir eventos increíbles</p>
          </motion.div>

          {/* Formulario */}
          <motion.form 
            className="space-y-6"
            onSubmit={handleLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block caption font-semibold text-gray-700">
                Correo electrónico
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <InputText
                  className={`${inputStylesGlass} transition-all duration-300 hover:shadow-lg focus:shadow-xl`}
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label className="block caption font-semibold text-gray-700">
                Contraseña
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <InputText
                  className={`${inputStylesGlass} pr-12 transition-all duration-300 hover:shadow-lg focus:shadow-xl`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <motion.button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? 
                    <EyeOff className="w-5 h-5 text-gray-500" /> : 
                    <Eye className="w-5 h-5 text-gray-500" />
                  }
                </motion.button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Recordar cuenta y olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-2 border-purple-400 text-purple-600 focus:ring-purple-500 focus:ring-2"
                />
                <span className="small-text text-gray-600 group-hover:text-purple-600 transition-colors duration-200">
                  Recordar cuenta
                </span>
              </label>
              
              <Link 
                to="/recuperar-cuenta" 
                className="small-text text-purple-600 hover:text-purple-800 transition-colors duration-200 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de inicio de sesión */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className={`${buttonStyle} btn-premium relative overflow-hidden font-semibold py-3 text-base`}
                type="submit"
                loading={loading}
                disabled={loading}
              >
                <motion.div 
                  className="flex items-center justify-center space-x-2"
                  initial={false}
                  animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </motion.div>
              </Button>
            </motion.div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 text-gray-500 small-text">o</span>
              </div>
            </div>

            {/* Crear cuenta */}
            <div className="text-center space-y-4">
              <p className="body-text text-gray-600">
                ¿No tienes una cuenta?
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/crear-cuenta"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white/70 hover:bg-white/90 text-purple-700 font-semibold rounded-full border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg"
                >
                  <Star className="w-5 h-5" />
                  <span>Crear cuenta</span>
                </Link>
              </motion.div>
            </div>
          </motion.form>
        </div>

        {/* Texto decorativo inferior */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="small-text text-gray-500">
            Conecta con personas que comparten tus pasiones
          </p>
        </motion.div>
      </motion.div>

      {/* Toast component for notifications */}
      <Toast ref={toast} />
    </div>
  );
};

export default LoginClean;
