import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterCompany from './pages/RegisterCompany';
import Login from './pages/Login';
import Clients from './pages/Clients';
import CompanySettings from './pages/CompanySettings';
import Assignments from './pages/Assignments';
import Workers from './pages/Workers';
import MyRoutes from './pages/MyRoutes';
import Billing from './pages/Billing';

// Guardia de Ruta de Alta Ingeniería
const ProtectedRoute = ({ children, allowedRoles }) => {
    const userString = localStorage.getItem('glassy_user');
    if (!userString) return <Navigate to="/login" replace />;
    
    const user = JSON.parse(userString);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirigir según el rol si no tiene permiso (Isolation total)
        return <Navigate to={user.role === 'worker' ? "/app/my-routes" : "/app/clients"} replace />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterCompany />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Gestión Administrativa (Solo Owner/Admin) */}
        <Route path="/app" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Clients /></ProtectedRoute>} />
        <Route path="/app/clients" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Clients /></ProtectedRoute>} />
        <Route path="/app/settings" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><CompanySettings /></ProtectedRoute>} />
        <Route path="/app/workers" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Workers /></ProtectedRoute>} />
        <Route path="/app/assignments" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Assignments /></ProtectedRoute>} />
        <Route path="/app/billing" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Billing /></ProtectedRoute>} />

        {/* Rutas de Campo (Mis Rutas - Acceso Universal pero contenido filtrado por backend) */}
        <Route path="/app/my-routes" element={<ProtectedRoute allowedRoles={['worker', 'owner', 'admin']}><MyRoutes /></ProtectedRoute>} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
