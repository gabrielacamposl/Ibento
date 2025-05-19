import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// ------------------ CONFIGURACIÓN GLOBAL ------------------
// Configuración de la URL base

const api = axios.create({
  baseURL: "https://ibento.onrender.com", 

});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("access"); 
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
