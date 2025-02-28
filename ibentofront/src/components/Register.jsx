import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Importa useNavigate para redirección
import { registerUser } from "../api";

export default function Register() {
  const navigate = useNavigate(); // ✅ Hook para redirección
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("❌ Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await registerUser({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
      });

      if (response.mensaje) {
        setMessage("✅ " + response.mensaje);
        setTimeout(() => navigate("/confirmar"), 2000); // ✅ Redirigir después de 2s
      } else {
        setMessage("❌ Error al registrar usuario");
      }
    } catch (error) {
      setMessage("❌ Hubo un error en el servidor");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Correo" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirmar Contraseña" onChange={handleChange} required />
        <button className="bg-blue-500 text-white p-2 rounded">Registrarse</button>
      </form>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}
