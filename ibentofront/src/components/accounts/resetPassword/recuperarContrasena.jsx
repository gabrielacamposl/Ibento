import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext"; 
import { buttonStyle, inputStyles} from "../../../styles/styles";
import { useNavigate } from "react-router-dom";
import { Mail, Send, ArrowLeft, Shield, Clock } from "lucide-react";
import api from "../../../api";

const colors = ["#FF00FF", "#00FFFF", "#FFFFFF", "#9333EA", "#3B82F6"];

// Regex para validación de email más robusta
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warn' ? 'bg-yellow-500' : 'bg-blue-500';
    toast.className += ` ${bgColor}`;
    
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white/70 hover:text-white">✕</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Por favor ingresa un correo electrónico válido");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validación en tiempo real
    if (value && !emailRegex.test(value)) {
      setEmailError("Formato de email inválido");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar email antes de enviar
    if (!validateEmail(email)) {
      setLoading(false);
      showToast("Por favor ingresa un correo electrónico válido", 'warn');
      return;
    }

    try {
      const response = await api.post("password-reset/request/", { 
        email: email.trim().toLowerCase() 
      });
      
      showToast("¡Código enviado! Revisa tu correo electrónico", 'success');
      localStorage.setItem("emailReset", email.trim().toLowerCase());
      
      setTimeout(() => {
        navigate("/recuperar-cuenta-codigo");
      }, 2000); 
    } catch (err) {
      console.error("Error al solicitar recuperación:", err);
      
      let errorMessage = "Error al enviar la solicitud";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.request) {
        errorMessage = "Error de conexión. Verifica tu internet.";
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
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
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-gray-800 font-bold text-2xl mb-2">
                Recuperar Contraseña
              </h1>
              <p className="text-gray-600 text-sm">
                Ingresa tu correo electrónico y te enviaremos un código de verificación
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Correo electrónico <span className="text-pink-500">*</span>
                </label>
                <div className="relative group">
                  <InputText
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border transition-all duration-300 text-gray-800 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                      emailError ? 'border-red-400' : 'border-black/30'
                    }`}
                    required
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className={`w-5 h-5 transition-colors ${
                      emailError ? 'text-red-500' : 'text-gray-600 group-focus-within:text-purple-500'
                    }`} />
                  </div>
                </div>
                
                {/* Validación en tiempo real */}
                {emailError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs mt-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>{emailError}</span>
                  </div>
                )}
                
                {email && !emailError && emailRegex.test(email) && (
                  <div className="flex items-center gap-2 text-green-600 text-xs mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Correo electrónico válido</span>
                  </div>
                )}
              </div>

              {/* Botón de enviar */}
              <div className="transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Button 
                  className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                  type="submit"
                  loading={loading}
                  disabled={loading || emailError || !email}
                >
                  {loading ? (
                    'Enviando código...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Código
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Información adicional */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200 relative z-10">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-blue-800 font-medium text-sm mb-1">¿No recibes el código?</h3>
                  <ul className="text-blue-600 text-xs space-y-1">
                    <li>• Revisa tu carpeta de spam o correo no deseado</li>
                    <li>• El código puede tardar hasta 5 minutos en llegar</li>
                    <li>• Verifica que el correo esté escrito correctamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Volver al login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white text-sm transition-colors hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
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