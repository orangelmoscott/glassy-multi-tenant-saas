import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterCompany from './pages/RegisterCompany';
// Las demás páginas se irán integrando según el avance
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas de Glassy */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterCompany />} />
        <Route path="/login" element={<div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">Próximamente: Login Glassy</div>} />
        
        {/* Rutas Protegidas de la Empresa (Tenants) */}
        <Route path="/app" element={<div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-6 font-bold text-blue-600">Glassy Panel - Seleccione una Empresa</div>} />
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
