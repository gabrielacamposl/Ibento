// src/axiosConfig.js
import axios from 'axios';
const API_BASE_URL_A = import.meta.env.VITE_API_BASE_URL_ADMIN;


const apiaxios = axios.create({
  baseURL: API_BASE_URL_A, 
});

export default apiaxios;
