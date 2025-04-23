// src/components/LogoutButton.jsx
import React from 'react';
import api from '../../axiosConfig';

const LogoutButton = () => {
  const logout = async () => {
    try {
      const token = localStorage.getItem('access');
      await api.post(
        'logout/',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      alert('Sesión cerrada');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return <button onClick={logout}>Cerrar Sesión</button>;
};

export default LogoutButton;
