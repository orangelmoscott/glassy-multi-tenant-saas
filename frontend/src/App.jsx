import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterCompany from './pages/RegisterCompany';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Clients from './pages/Clients';
import CompanySettings from './pages/CompanySettings';
import Assignments from './pages/Assignments';
import Workers from './pages/Workers';
import MyRoutes from './pages/MyRoutes';
import Billing from './pages/Billing';
import ResetPassword from './pages/ResetPassword';

// Componente Profesional de Guardia de Ruta (RBAC & Planes)
const ProtectedRoute = ({ children, allowedRoles, requireExclusivePlan = false, tier = 'pro' }) => {
    const userString = localStorage.getItem('glassy_user');
    if (!userString) return <Navigate to="/login" replace />;
    
    const user = JSON.parse(userString);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const isWorker = user.role === 'worker' || user.role === 'cristalero';
        return <Navigate to={isWorker ? "/app/my-routes" : "/app/clients"} replace />;
    }

    if (requireExclusivePlan) {
        const userPlan = (user.planId || user.plan || 'starter').toLowerCase();
        
        // Tier 'pro' bloquea starter y basico
        if (tier === 'pro' && ['starter', 'basico', 'autonomo'].includes(userPlan)) {
            return <Navigate to="/app/clients" replace />;
        }
        
        // Tier 'basico' bloquea solo starter
        if (tier === 'basico' && userPlan === 'starter') {
            return <Navigate to="/app/clients" replace />;
        }
    }

    return children;
};

/**
 * Hook Global de Sincronización de Pagos
 * Se ejecuta en cualquier ruta protegida. Verifica si hay un pago pendiente
 * de Stripe en localStorage y lo sincroniza automáticamente con el backend.
 * Esto garantiza que el plan se active incluso si el webhook de Stripe falla.
 */
function useGlobalStripeSync() {
    useEffect(() => {
        const syncPendingPayment = async () => {
            // 1. Buscar session_id en la URL (Stripe Redirect) o en localStorage (Auto-Heal)
            const urlParams = new URLSearchParams(window.location.search);
            const sessionIdFromUrl = urlParams.get('session_id');
            const pendingFromStorage = localStorage.getItem('stripe_pending_session');
            
            const sessionId = sessionIdFromUrl || pendingFromStorage;
            if (!sessionId) return;

            const userStr = localStorage.getItem('glassy_user');
            if (!userStr) return;

            const user = JSON.parse(userStr);
            if (!user.token) return;

            try {
                const res = await axios.post(
                    'https://glassy-backend.onrender.com/tenant/sync-subscription',
                    { sessionId },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );

                const updatedTenant = res.data.tenant;
                if (updatedTenant && updatedTenant.planActivo) {
                    // Actualizar localStorage
                    const newUser = {
                        ...user,
                        plan: updatedTenant.planId,
                        planId: updatedTenant.planId,
                        planActivo: true,
                        trialDaysLeft: null
                    };
                    localStorage.setItem('glassy_user', JSON.stringify(newUser));
                    
                    // Limpiar estados de sincronización pendientes
                    localStorage.removeItem('stripe_pending_session');
                    
                    // Limpiar la URL de parámetros de Stripe para que no se repita el proceso al refrescar
                    if (sessionIdFromUrl) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }

                    // Recargar para aplicar cambios globales en DashboardLayout (RBAC/Guards)
                    window.location.reload();
                }
            } catch (err) {
                console.error('Global stripe sync error:', err);
                // Si falla, no limpiamos el storage para reintentar, pero sí la URL para no buclear
                if (sessionIdFromUrl) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        };

        syncPendingPayment();
    }, []);
}

function App() {
    useGlobalStripeSync();

    return (
        <Router>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterCompany />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                {/* Rutas Corporativas (Solo para Dueños/Administradores) */}
                <Route path="/app" element={<ProtectedRoute allowedRoles={['owner', 'admin']} requireExclusivePlan={true} tier="pro"><Dashboard /></ProtectedRoute>} />
                <Route path="/app/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']} requireExclusivePlan={true} tier="pro"><Dashboard /></ProtectedRoute>} />
                <Route path="/app/clients" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Clients /></ProtectedRoute>} />
                <Route path="/app/settings" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><CompanySettings /></ProtectedRoute>} />
                <Route path="/app/workers" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Workers /></ProtectedRoute>} />
                <Route path="/app/assignments" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><Assignments /></ProtectedRoute>} />
                <Route path="/app/expenses" element={<ProtectedRoute allowedRoles={['owner', 'admin']} requireExclusivePlan={true} tier="pro"><Expenses /></ProtectedRoute>} />
                <Route path="/app/billing" element={<ProtectedRoute allowedRoles={['owner', 'admin']} requireExclusivePlan={true} tier="basico"><Billing /></ProtectedRoute>} />

                {/* Canales de Campo (Operarios) */}
                <Route path="/app/my-routes" element={<ProtectedRoute allowedRoles={['worker', 'cristalero', 'owner', 'admin']}><MyRoutes /></ProtectedRoute>} />

                {/* Global Redirector */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

