import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, BarChart3, Settings, 
  LogOut, LayoutDashboard, Menu, X, 
  CreditCard, HardHat, FileText, MapPin, Sparkles, Receipt, Briefcase, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const userString = localStorage.getItem('glassy_user');
    const user = userString ? JSON.parse(userString) : { role: 'cristalero', username: 'Usuario' };
    const isOwner = user.role === 'owner' || user.role === 'admin';

    // AUTO-HEAL: Sincronizar pago si hay una sesión pendiente y el plan parece inactivo
    useEffect(() => {
        const checkPendingSession = async () => {
            const pendingSessionId = localStorage.getItem('stripe_pending_session');
            if (isOwner && !user.planActivo && pendingSessionId) {
                try {
                    const res = await axios.post(
                        'https://glassy.es/api/tenant/sync-subscription', 
                        { sessionId: pendingSessionId },
                        { headers: { Authorization: `Bearer ${user.token}` }}
                    );
                    
                    if (res.data.tenant && res.data.tenant.planActivo) {
                        const updatedTenant = res.data.tenant;
                        const newUser = { 
                            ...user, 
                            plan: updatedTenant.planId, 
                            planId: updatedTenant.planId,
                            planActivo: true,
                            trialDaysLeft: null 
                        };
                        localStorage.setItem('glassy_user', JSON.stringify(newUser));
                        localStorage.removeItem('stripe_pending_session');
                        window.location.reload();
                    }
                } catch (err) {
                    console.error("Error en auto-heal synchronization:", err);
                }
            }
        };

        checkPendingSession();
    }, [isOwner, user.planActivo, user.token]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Resumen', path: '/app/dashboard', roles: ['owner', 'admin'], restrictedPlans: ['starter', 'basico', 'autonomo'] },
        { icon: Users, label: 'Clientes', path: '/app/clients', roles: ['owner', 'admin'] },
        { icon: HardHat, label: 'Operarios', path: '/app/workers', roles: ['owner', 'admin'] },
        { icon: Calendar, label: 'Rutas', path: '/app/assignments', roles: ['owner', 'admin'] },
        { icon: MapPin, label: 'Mis Rutas', path: '/app/my-routes', roles: ['worker', 'cristalero'] },
        { icon: FileText, label: 'Facturación', path: '/app/billing', roles: ['owner', 'admin'], restrictedPlans: ['starter'] },
        { icon: Receipt, label: 'Gastos', path: '/app/expenses', roles: ['owner', 'admin'], restrictedPlans: ['starter', 'basico', 'autonomo'] },
        { icon: Settings, label: 'Configuración', path: '/app/settings', roles: ['owner', 'admin'] },
    ];

    const handleLogout = () => {
        localStorage.removeItem('glassy_user');
        navigate('/login');
    };

    const _userPlan = (user.planId || user.plan || 'starter').toLowerCase();

    const filteredMenu = menuItems.filter(item => {
        if (!item.roles.includes(user.role)) return false;
        if (item.restrictedPlans && item.restrictedPlans.includes(_userPlan)) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#f6f9fc] flex flex-col md:flex-row font-sans selection:bg-indigo-100 overflow-x-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-[#e3e8ee] px-6 py-4 flex items-center justify-between sticky top-0 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#635bff] to-[#4f46e5] flex items-center justify-center text-white font-black text-lg">G</div>
                    <span className="font-bold text-[#0a2540] tracking-tight">Glassy</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="p-2 text-[#425466] hover:bg-[#f6f9fc] rounded-lg transition-all"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar */}
            <AnimatePresence>
                {(isMobileMenuOpen || !window.matchMedia('(max-width: 768px)').matches) && (
                    <motion.aside 
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className={`
                            fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-white border-r border-[#e3e8ee] flex flex-col shadow-xl md:shadow-none
                            ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}
                        `}
                    >
                        {/* Logo */}
                        <div className="p-7 mb-2 flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635bff] to-[#4f46e5] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">G</div>
                             <span className="text-xl font-bold text-[#0a2540] tracking-tight">Glassy</span>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                            {filteredMenu.map((item) => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 group
                                        ${location.pathname === item.path 
                                            ? 'bg-white text-[#635bff] shadow-sm border border-[#e3e8ee]' 
                                            : 'text-[#425466] hover:text-[#0a2540] hover:bg-[#f6f9fc]'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className={`${location.pathname === item.path ? 'text-[#635bff]' : 'text-[#697386] group-hover:text-[#0a2540]'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {location.pathname === item.path && <ChevronRight size={14} className="text-[#635bff]" />}
                                </Link>
                            ))}
                        </nav>

                        {/* Footer Sidebar */}
                        <div className="p-4 border-t border-[#e3e8ee] bg-[#fcfdfe]">
                            {isOwner && !user.planActivo && (
                                <div className="mb-4 p-3 rounded-xl bg-[#635bff] text-white shadow-lg shadow-indigo-100 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/app/settings')}>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                                            <Sparkles size={10} /> Trial Period
                                        </div>
                                        <p className="text-xs font-bold">{user.trialDaysLeft} días restantes</p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <ArrowRight size={32} />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 px-2 mb-4">
                                <div className="w-8 h-8 bg-indigo-50 text-[#635bff] rounded-lg flex items-center justify-center font-bold text-xs border border-indigo-100 uppercase">
                                    {user.username?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-[#0a2540] truncate">{user.username}</p>
                                    <p className="text-[10px] text-[#697386] font-bold uppercase tracking-tight">{user.role}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-xs text-[#697386] hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                                <LogOut size={16} />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Backdrop Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="md:hidden fixed inset-0 bg-[#0a2540]/30 backdrop-blur-sm z-40"
                  />
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto w-full relative">
                <div className="max-w-6xl mx-auto w-full animate-fade-up">
                    {children}
                </div>
            </main>

            {/* Trial Expiry Overlay */}
            {isOwner && !user.planActivo && (user.trialDaysLeft ?? 1) <= 0 && location.pathname !== '/app/settings' && (
                <div className="fixed inset-0 bg-[#0a2540]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl border border-[#e3e8ee]"
                    >
                        <div className="w-16 h-16 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CreditCard size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-[#0a2540] mb-3">Tu prueba ha expirado</h2>
                        <p className="text-sm text-[#697386] mb-8 leading-relaxed">
                            Esperamos que Glassy haya ayudado a tu negocio estos últimos 7 días. Activa un plan profesional para seguir operando sin interrupciones.
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/app/settings')}
                                className="w-full bg-[#635bff] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-[#4f46e5] transition-all flex items-center justify-center gap-2"
                            >
                                Ver Planes y Activar
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full text-[#697386] py-2 font-semibold text-xs hover:text-[#0a2540] transition-all"
                            >
                                Salir del sistema
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
