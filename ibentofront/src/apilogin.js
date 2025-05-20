import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor que omite agregar el token en login y refresh
api.interceptors.request.use(config => {
  if (
    config.url.includes("login") ||
    config.url.includes("refresh")
  ) {
    return config;
  }

  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
