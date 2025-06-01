import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PrimeReactProvider } from 'primereact/api';
import ServiceWorkerProvider from './components/ServiceWorkerProvider';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ServiceWorkerProvider>
      <App />
    </ServiceWorkerProvider>
  </React.StrictMode>
);





