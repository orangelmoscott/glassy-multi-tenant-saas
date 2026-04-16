import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

/**
 * INTERCEPTOR GLOBAL DE SEGURIDAD — Protección contra tokens expirados
 * 
 * Si CUALQUIER petición al backend recibe un 401 (token expirado o inválido),
 * se cierra la sesión automáticamente y se redirige al login.
 * Esto evita que un cristalero/usuario con sesión abierta por días
 * vea datos "fantasma" y no pueda operar.
 */
let isLoggingOut = false; // Evita múltiples redirects si varias peticiones fallan a la vez

axios.interceptors.response.use(
  (response) => response, // Si la respuesta es OK, no hacer nada
  (error) => {
    // Solo interceptar errores 401 de NUESTRO backend, NO de APIs externas (Mapbox, etc.)
    const requestUrl = error.config?.url || '';
    const isOwnBackend = requestUrl.includes('glassy.es') || requestUrl.startsWith('/api');

    if (error.response && error.response.status === 401 && isOwnBackend) {
      // Solo actuar si hay una sesión activa (evitar bucles en la pantalla de login)
      const hasSession = localStorage.getItem('glassy_user');
      if (hasSession && !isLoggingOut) {
        isLoggingOut = true;
        console.warn('⚠️ Sesión expirada detectada. Cerrando sesión automáticamente...');
        
        // Limpiar toda la sesión
        localStorage.removeItem('glassy_user');
        localStorage.removeItem('stripe_pending_session');
        
        // Redirigir al login con mensaje informativo
        window.location.href = '/login?expired=1';
        
        // Resetear el flag después de un momento (por si el redirect tarda)
        setTimeout(() => { isLoggingOut = false; }, 3000);
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
