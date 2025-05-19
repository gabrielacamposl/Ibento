import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/"


// ------------------ CONFIGURACIÓN GLOBAL ------------------
// Configuración de la URL base

const api = axios.create({
  baseURL:"http://127.0.0.1:8000/api/", 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("access"); 
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
