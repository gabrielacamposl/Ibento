import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PrimeReactProvider } from 'primereact/api';

// const root = ReactDOM.createRoot(document.getElementById('root'))
// root.render(<App />)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ---- Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registrado', reg))
      .catch(err => console.error('[SW] Error al registrar', err))
  });
}





