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
      throw new Error("Error en la petición");
    }

    return await response.json();
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
