// src/pages/CrearCuenta.jsx
import React, { useState } from 'react';
import api from '../../axiosConfig';

const CrearCuenta = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('crear-cuenta/', form);
      alert(res.data.mensaje);
    } catch (err) {
      alert('Error creando cuenta: ' + JSON.stringify(err.response.data));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" onChange={handleChange} placeholder="Nombre" />
      <input name="apellido" onChange={handleChange} placeholder="Apellido" />
      <input name="email" onChange={handleChange} placeholder="Email" type="email" />
      <input name="password" onChange={handleChange} placeholder="Contraseña" type="password" />
      <button type="submit">Crear Cuenta</button>
    </form>
  );
};

export default CrearCuenta;
