import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, BarChart3, Settings, 
  LogOut, LayoutDashboard, Menu, X, 
  CreditCard, HardHat, FileText, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const userString = localStorage.getItem('glassy_user');
    const user = userString ? JSON.parse(userString) : { role: 'worker', username: 'Usuario' };
    const isOwner = user.role === 'owner' || user.role === 'admin';

    const menuItems = [
        { icon: LayoutDashboard, label: 'Resumen', path: '/app/dashboard', roles: ['owner', 'admin'] },
        { icon: Users, label: 'Clientes', path: '/app/clients', roles: ['owner', 'admin'] },
        { icon: HardHat, label: 'Operarios', path: '/app/workers', roles: ['owner', 'admin'] },
        { icon: Calendar, label: 'Rutas', path: '/app/assignments', roles: ['owner', 'admin'] },
        { icon: MapPin, label: 'Mis Rutas', path: '/app/my-routes', roles: ['worker'] },
        { icon: FileText, label: 'Facturación', path: '/app/billing', roles: ['owner', 'admin'] },
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
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-md">G</div>
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
                        <div className="hidden md:flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">G</div>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter italic">Glassy</span>
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
            <main className="flex-1 p-4 md:p-12 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
