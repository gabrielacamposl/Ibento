import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Typography } from "@mui/material";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { buttonStyle, inputStyles } from "../../../styles/styles";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Shield, CheckCircle } from "lucide-react";
import api from "../../../api";
import { password_regex } from "../../../utils/regex";

const colors = ["#FF00FF", "#00FFFF", "#FFFFFF", "#9333EA", "#3B82F6"];

export default function PasswordResetChange() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const emailGuardado = localStorage.getItem("emailReset");
    if (!emailGuardado) {
      navigate("/recuperar-cuenta");
    } else {
      setEmail(emailGuardado);
    }
  }, [navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    // Validaciones
    if (!password || !passwordConfirm) {
      showToast("Por favor completa todos los campos", 'warn');
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      showToast("Las contraseñas no coinciden", 'error');
      setLoading(false);
      return;
    }

    if (!password_regex.test(password)) {
      showToast("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número", 'warn');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("password-reset/change/", {
        email: email,
        new_password: password,
      });

      showToast("¡Contraseña cambiada exitosamente!", 'success');
      localStorage.removeItem("emailReset");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      showToast(err.response?.data?.error || "Error al cambiar la contraseña", 'error');
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
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-gray-800 font-bold text-2xl mb-2">
                Nueva Contraseña
              </h1>
              <p className="text-gray-600 text-sm">
                Crea una contraseña segura para tu cuenta
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Campo Nueva Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Nueva contraseña <span className="text-pink-500">*</span>
                </label>
                <div className="relative group">
                  <InputText
                    className="w-full pl-12 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-black/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    required
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
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
                
                {/* Indicador de fortaleza de contraseña */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                        Al menos 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        Una letra mayúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        Un número
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Campo Confirmar Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Confirmar contraseña <span className="text-pink-500">*</span>
                </label>
                <div className="relative group">
                  <InputText
                    className="w-full pl-12 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-black/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    required
                    name="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    id="passwordConfirm"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Confirma tu contraseña"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-purple-500 transition-colors"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Indicador de coincidencia */}
                {passwordConfirm && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${password === passwordConfirm ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={password === passwordConfirm ? 'text-green-600' : 'text-red-600'}>
                        {password === passwordConfirm ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de cambiar contraseña */}
              <div className="transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Button 
                  className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                  type="submit"
                  loading={loading}
                  disabled={loading || password !== passwordConfirm || !password_regex.test(password)}
                >
                  {loading ? (
                    'Cambiando contraseña...'
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Información de seguridad */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200 relative z-10">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-blue-800 font-medium text-sm mb-1">Consejos de seguridad</h3>
                  <ul className="text-blue-600 text-xs space-y-1">
                    <li>• Usa una combinación única de letras, números y símbolos</li>
                    <li>• No uses información personal como fechas o nombres</li>
                    <li>• Considera usar un gestor de contraseñas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Volver al login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white text-sm transition-colors hover:underline"
            >
              ← Volver al inicio de sesión
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