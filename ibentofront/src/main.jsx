import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

// ---- Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('[SW] Registrado', reg))
      .catch(err => console.error('[SW] Error al registrar', err))
  })
}

