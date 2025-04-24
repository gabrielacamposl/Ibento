// src/pages/Login.jsx
import React, { useState } from 'react';
import api from '../../axiosConfig';

const Login = () => {
  const [cred, setCred] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCred({ ...cred, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('login/', cred);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      alert('Sesión iniciada');
      window.location.href = '/logout'; // redirige a otra vista
    } catch (err) {
      alert('Error al iniciar sesión: ' + JSON.stringify(err.response.data));
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input name="email" onChange={handleChange} placeholder="Email" type="email" />
      <input name="password" onChange={handleChange} placeholder="Contraseña" type="password" />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};

export default Login;
