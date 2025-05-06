import axios from "axios";


// ------------------ CONFIGURACIÓN GLOBAL ------------------
// Configuración de la URL base

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/", 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("access"); 
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


// Verifica que esta línea esté presente para exportar la función
export async function registerUser(userData) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/usuarios/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de API:", errorData);
      throw new Error(errorData?.detail || "Error en la petición");
    }

    const data = await response.json();
    console.log("Respuesta de la API:", data);
    return data;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}





export async function confirmUser(token) {
  try {
      const response = await fetch(`http://127.0.0.1:8000/api/confirmar/${token}/`, {
          method: "GET",  // Si el backend acepta GET para confirmar
          headers: {
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("Error en confirmUser:", errorData);
          throw new Error("Error al confirmar usuario");
      }

      return await response.json();
  } catch (error) {
      console.error("Error en confirmUser:", error);
      throw error;
  }
}
