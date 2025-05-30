import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../apilogin';

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');
        
        // Si no hay tokens, el usuario no está autenticado
        if (!accessToken || !refreshToken) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }        // Verificar si el token es válido haciendo una petición de prueba
        try {
          await api.get('estado-validacion/'); // Usar endpoint existente que requiere autenticación
          setIsAuthenticated(true);
        } catch (error) {
          // Si el token no es válido, intentar renovarlo
          try {
            const response = await api.post('refresh-token/', {
              refresh: refreshToken
            });
            
            // Actualizar el token de acceso
            localStorage.setItem('access', response.data.access);
            setIsAuthenticated(true);
          } catch (refreshError) {
            // Si no se puede renovar, limpiar localStorage y marcar como no autenticado
            localStorage.clear();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.clear();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated !== null) {
      const currentPath = location.pathname;
      
      // Si el usuario está autenticado y está en la página de login o raíz
      if (isAuthenticated && (currentPath === '/' || currentPath === '/login')) {
        navigate('/ibento/eventos', { replace: true });
      }
      
      // Si el usuario no está autenticado y está intentando acceder a rutas protegidas
      if (!isAuthenticated && currentPath.startsWith('/ibento')) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Mostrar loading mientras verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
