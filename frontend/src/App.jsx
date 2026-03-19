import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterCompany from './pages/RegisterCompany';
import Login from './pages/Login';
import Clients from './pages/Clients';

// Dashboard Placeholder
const DashboardHome = () => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
    <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-xl">
        <LayoutDashboard size={48} />
    </div>
    <h1 className="text-4xl font-extrabold text-slate-900">Bienvenido a su Panel Glassy</h1>
    <p className="text-slate-500 max-w-md">Selecciona un módulo en la barra lateral para empezar a gestionar tu empresa de limpieza.</p>
  </div>
);

import { LayoutDashboard } from 'lucide-react';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterCompany />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas de la Empresa (Dashboard) */}
        <Route path="/app" element={<Clients />} /> {/* Redirigimos por ahora a Clientes para que vea acción */}
        <Route path="/app/clients" element={<Clients />} />
        
        {/* Próximamente: Rutas y Facturación */}
        <Route path="/app/assignments" element={<div className="p-10 text-center font-bold text-slate-400">Próximamente: Gestión de Rutas (Plan Pro)</div>} />
        <Route path="/app/billing" element={<div className="p-10 text-center font-bold text-slate-400">Próximamente: Finanzas y Facturación</div>} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
