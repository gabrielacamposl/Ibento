import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor de REQUEST - Agregar token a las peticiones
api.interceptors.request.use(config => {
  // Omitir token en login y refresh
  if (
    config.url.includes("login") ||
    config.url.includes("refresh-token")
  ) {
    return config;
  }

  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de RESPONSE - Manejar renovación automática de tokens
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la retornamos
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Verificar si es un error de token expirado
      const errorData = error.response?.data;
      const isTokenExpired = errorData?.code === "TOKEN_EXPIRED" || 
                           errorData?.error?.includes("Token expirado") ||
                           errorData?.error?.includes("token") ||
                           errorData?.detail?.includes("token");

      if (isTokenExpired) {
        // Si ya estamos refrescando el token, agregar a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
          // No hay refresh token, redirigir a login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          // Intentar renovar el token
          const refreshResponse = await axios.post(`${API_BASE_URL}refresh-token/`, {
            refresh: refreshToken
          });

          const newAccessToken = refreshResponse.data.access;
          
          // Guardar el nuevo token
          localStorage.setItem("access", newAccessToken);
          
          // Actualizar el header de la petición original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Procesar cola de peticiones pendientes
          processQueue(null, newAccessToken);
          
          isRefreshing = false;
          
          // Reintentar la petición original
          return api(originalRequest);

        } catch (refreshError) {
          // El refresh token también expiró o es inválido
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Limpiar localStorage y redirigir a login
          localStorage.clear();
          
          // Mostrar mensaje al usuario antes de redirigir
          alert("Tu sesión ha expirado. Serás redirigido al login.");
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        }
      }
    }

    // Si no es error 401 o no es relacionado con tokens, rechazar normalmente
    return Promise.reject(error);
  }
);

export default api;