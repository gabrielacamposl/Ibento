import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, RotateCcw, Clock, Mail } from "lucide-react";
import api from "../../../api";

const colors = ["#FF00FF", "#00FFFF", "#FFFFFF", "#9333EA", "#3B82F6"];

export default function PasswordResetValidate() {
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    const emailGuardado = localStorage.getItem("emailReset");
    if (!emailGuardado) {
      navigate("/recuperar-cuenta");
    } else {
      setEmail(emailGuardado);
    }
  }, [navigate]);

  // Timer para reenvío
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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

  const handleInputChange = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Auto-focus al siguiente campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Manejar backspace
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Manejar paste
    if (e.key === 'Paste' || (e.ctrlKey && e.key === 'v')) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newCodigo = [...codigo];
        for (let i = 0; i < 6; i++) {
          newCodigo[i] = digits[i] || '';
        }
        setCodigo(newCodigo);
        
        // Focus al último campo con contenido o al primero vacío
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length !== 6) {
      showToast("Por favor ingresa el código completo de 6 dígitos", 'warn');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("password-reset/validate/", {
        email: email,
        codigo: codigoCompleto,
      });
      
      showToast("¡Código válido! Redirigiendo...", 'success');
      
      setTimeout(() => {
        navigate("/recuperar-cuenta-nueva-contrasena"); 
      }, 2000);
    } catch (err) {
      console.error("Error al validar código:", err);
      
      let errorMessage = "Error al validar el código";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      showToast(errorMessage, 'error');
      
      // Limpiar código en caso de error
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setResendLoading(true);
    
    try {
      const response = await api.post("password-reset/resend/", {
        email: email,
      });
      
      showToast("¡Nuevo código enviado! Revisa tu correo", 'success');
      setResendTimer(120); // 2 minutos
      
      // Limpiar código actual
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Error al reenviar código:", err);
      
      let errorMessage = "Error al reenviar el código";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setResendLoading(false);
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

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                Código de Verificación
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                Ingresa el código de 6 dígitos que enviamos a
              </p>
              <p className="text-purple-600 font-medium text-sm">
                {email}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Campos de código */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800 text-center">
                  Código de recuperación de contraseña:
                </label>
                <div className="flex justify-center gap-3">
                  {codigo.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 text-gray-800"
                      disabled={loading}
                      autoComplete="off"
                    />
                  ))}
                </div>
                
                {/* Indicador de progreso */}
                <div className="flex justify-center mt-3">
                  <div className="flex gap-1">
                    {codigo.map((digit, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          digit ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón de validar */}
              <div className="transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Button 
                   className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                  loading={loading}
                  disabled={loading || codigo.join('').length !== 6}
                >
                  {loading ? (
                    'Validando código...'
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Validar Código
                    </>
                  )}
                </Button>
              </div>

              {/* Reenviar código */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-3">¿No recibiste el código?</p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || resendLoading}
                  className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    resendTimer > 0 || resendLoading 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-purple-600 hover:text-purple-800 hover:underline'
                  }`}
                >
                  {resendLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : resendTimer > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      Reenviar en {formatTimer(resendTimer)}
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Enviar código nuevamente
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Información adicional */}
            <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200 relative z-10">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="text-amber-800 font-medium text-sm mb-1">Consejos</h3>
                  <ul className="text-amber-700 text-xs space-y-1">
                    <li>• El código expira en 10 minutos</li>
                    <li>• Puedes pegar el código directamente desde tu correo</li>
                    <li>• Revisa la carpeta de spam si no lo encuentras</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Volver atrás */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/recuperar-cuenta")}
              className="text-white/80 hover:text-white text-sm transition-colors hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Usar otro correo electrónico
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