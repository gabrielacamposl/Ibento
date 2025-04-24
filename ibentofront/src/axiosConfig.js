// src/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // cambia esto si es distinto
});

export default api;
