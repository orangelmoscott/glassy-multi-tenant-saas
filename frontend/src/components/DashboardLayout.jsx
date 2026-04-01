import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, BarChart3, Settings, 
  LogOut, LayoutDashboard, Menu, X, 
  CreditCard, HardHat, FileText, MapPin, Sparkles, Receipt, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const userString = localStorage.getItem('glassy_user');
    const user = userString ? JSON.parse(userString) : { role: 'cristalero', username: 'Usuario' };
    const isOwner = user.role === 'owner' || user.role === 'admin';

    React.useEffect(() => {
        if (isOwner && (user.plan === 'starter' || user.planId === 'starter') && user.trialDaysLeft <= 0) {
            console.log("Trial expired notice triggered");
        }
    }, [isOwner, user.plan, user.planId, user.trialDaysLeft]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Resumen', path: '/app/dashboard', roles: ['owner', 'admin'] },
        { icon: Users, label: 'Clientes', path: '/app/clients', roles: ['owner', 'admin'] },
        { icon: HardHat, label: 'Operarios', path: '/app/workers', roles: ['owner', 'admin'] },
        { icon: Calendar, label: 'Rutas', path: '/app/assignments', roles: ['owner', 'admin'] },
        { icon: MapPin, label: 'Mis Rutas', path: '/app/my-routes', roles: ['worker', 'cristalero'] },
        { icon: FileText, label: 'Facturación', path: '/app/billing', roles: ['owner', 'admin'] },
        { icon: Receipt, label: 'Gastos', path: '/app/expenses', roles: ['owner', 'admin'] },
        { icon: Settings, label: 'Mi Empresa', path: '/app/settings', roles: ['owner', 'admin'] },
    ];

    const handleLogout = () => {
        localStorage.removeItem('glassy_user');
        navigate('/login');
    };

    const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-x-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/favicon.png" alt="Glassy Icon" className="w-8 h-8 object-contain" />
                    <span className="font-extrabold text-slate-900 tracking-tight">Glassy</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar (Desktop) & Menu (Mobile Overlay) */}
            <AnimatePresence>
                {(isMobileMenuOpen || !window.matchMedia('(max-width: 768px)').matches) && (
                    <motion.aside 
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`
                            fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-72 bg-white border-r border-slate-100 p-8 flex flex-col shadow-2xl md:shadow-none
                            ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}
                        `}
                    >
                        <div className="hidden md:flex items-center gap-3 mb-10 overflow-hidden px-2">
                            <img src="/logo.png" alt="Glassy Logo" className="h-10 w-auto object-contain" />
                        </div>

                        <nav className="flex-1 space-y-2">
                            {filteredMenu.map((item) => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300
                                        ${location.pathname === item.path 
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    <item.icon size={22} strokeWidth={2.5} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="pt-8 border-t border-slate-50 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-100 uppercase shadow-sm">
                                    {user.username?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <LogOut size={22} strokeWidth={2.5} />
                                <span>Salir del Sistema</span>
                            </button>
                        </div>
                        
                        {isOwner && (user.plan === 'starter' || user.planId === 'starter') && (
                            <div className={`mt-6 p-4 rounded-2xl border shadow-sm transition-colors ${user.trialDaysLeft <= 0 ? 'bg-red-50 border-red-200' : 'bg-gradient-to-tr from-amber-50 to-orange-50 border-amber-100/50'}`}>
                                <div className={`flex items-center gap-2 mb-2 font-extrabold text-[10px] uppercase tracking-tighter ${user.trialDaysLeft <= 0 ? 'text-red-700' : 'text-amber-700'}`}>
                                    <Sparkles size={14} className={user.trialDaysLeft > 0 ? "animate-pulse" : ""} /> {user.trialDaysLeft <= 0 ? 'PERIODO EXPIRADO' : 'Periodo de Prueba'}
                                </div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">
                                    {user.trialDaysLeft <= 0 ? (
                                        <span className="text-red-600 font-extrabold">Renovación Necesaria</span>
                                    ) : (
                                        <>Te quedan <span className="text-amber-600 font-black">{user.trialDaysLeft} días</span></>
                                    )}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                    {user.trialDaysLeft <= 0 ? 'Suscríbete ahora para seguir operando tu negocio.' : 'Actualiza a un plan PRO antes de que expire.'}
                                </p>
                                <button 
                                    onClick={() => navigate('/app/settings')}
                                    className={`w-full mt-3 py-2 rounded-xl text-xs font-bold border shadow-sm transition-all active:scale-95 ${user.trialDaysLeft <= 0 ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    Ver Planes y Precios
                                </button>
                            </div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Backdrop Overlay for Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                  />
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-12 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* Trial Expiry Overlay - SOLO si está en starter Y no ha pagado Y no está en settings */}
            {isOwner && (user.plan === 'starter' || user.planId === 'starter') && !user.planActivo && (user.trialDaysLeft ?? 1) <= 0 && location.pathname !== '/app/settings' && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8">
                            <Sparkles size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Acceso Restringido</h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                            Tu periodo de prueba de <span className="text-slate-900 font-bold">7 días</span> ha llegado a su fin. 
                            Para continuar gestionando tus clientes y operarios, necesitas activar una suscripción profesional.
                        </p>
                        <div className="space-y-4">
                            <button 
                                onClick={() => navigate('/app/settings')}
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-extrabold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <CreditCard size={22} />
                                Activar Suscripción Profesional
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full text-slate-400 py-2 font-bold text-sm hover:text-slate-600 transition-all"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
