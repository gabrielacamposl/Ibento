const API_URL = "http://127.0.0.1:80000/api";


export async function confirmUser(token) {
    const response = await fetch(`http://127.0.0.1:8000/api/confirmar/ ${token}`);
    return response.json()
}

export async function registerUser(data) {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/usuarios/", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error en registerUser:", error);
      return { mensaje: "Error en la solicitud" };
    }
  }
  