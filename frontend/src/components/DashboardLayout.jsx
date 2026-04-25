import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  LogOut, Menu, X, ChevronRight, Bell, Search,
  CreditCard, Shield, Sparkles, Smartphone, BarChart3,
  Globe, Receipt, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
  const plan = user.plan || 'starter';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Panel', path: '/app/dashboard', roles: ['admin', 'owner'], minPlan: 'pro' },
    { icon: Users, label: 'Clientes', path: '/app/clients', roles: ['admin', 'owner'] },
    { icon: Calendar, label: 'Rutas', path: '/app/assignments', roles: ['admin', 'owner'] },
    { icon: Smartphone, label: 'Mis Rutas', path: '/app/my-routes', roles: ['admin', 'owner', 'cristalero'] },
    { icon: Users, label: 'Operarios', path: '/app/workers', roles: ['admin', 'owner'] },
    { icon: FileText, label: 'Facturación', path: '/app/billing', roles: ['admin', 'owner'], minPlan: 'basico' },
    { icon: Receipt, label: 'Gastos', path: '/app/expenses', roles: ['admin', 'owner'], minPlan: 'pro' },
    { icon: BarChart3, label: 'Estadísticas', path: '/app/stats', roles: ['admin', 'owner'], minPlan: 'pro' },
    { icon: Settings, label: 'Ajustes', path: '/app/settings', roles: ['admin', 'owner'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    const hasRole = item.roles.includes(user.role);
    if (!hasRole) return false;
    
    // Plan restrictions
    if (item.minPlan === 'pro' && (plan === 'starter' || plan === 'basico')) return false;
    if (item.minPlan === 'basico' && plan === 'starter') return false;
    if (item.minPlan === 'business' && (plan === 'starter' || plan === 'pro' || plan === 'basico')) return false;
    
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('glassy_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex font-sans">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 glass-sidebar transition-all duration-300 ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-[#f6f9fc]">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#635bff] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
              <span className="text-white font-bold text-xl tracking-tighter">G</span>
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-xl text-[#0a2540] tracking-tight"
              >
                Glassy
              </motion.span>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#f6f9fc] rounded-lg transition-colors text-[#697386]"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-[#635bff] shadow-sm font-bold'
                  : 'text-[#697386] hover:bg-[#f6f9fc] hover:text-[#0a2540] font-medium'
              }`}
            >
              <item.icon size={20} className={location.pathname === item.path ? 'text-[#635bff]' : 'text-[#aab7c4] group-hover:text-[#635bff]'} />
              {isSidebarOpen && <span>{item.label}</span>}
              {isSidebarOpen && location.pathname === item.path && (
                <motion.div layoutId="activeTab" className="ml-auto">
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          {isSidebarOpen && plan === 'starter' && (
            <div className="p-4 bg-gradient-to-br from-[#0a2540] to-[#425466] rounded-2xl text-white space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Plan Starter</span>
              </div>
              <p className="text-[10px] text-white/70 font-medium leading-relaxed">
                Desbloquea estadísticas avanzadas y gestión de operarios.
              </p>
              <button 
                onClick={() => navigate('/app/settings')}
                className="w-full py-2 bg-white text-[#0a2540] rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
              >
                Mejorar Plan
              </button>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#697386] hover:bg-rose-50 hover:text-rose-600 transition-all font-medium"
          >
            <LogOut size={20} className="text-[#aab7c4] group-hover:text-rose-500" />
            {isSidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#0a2540]/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-[70] flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b">
              <span className="font-bold text-xl text-[#0a2540]">Glassy</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-[#f6f9fc] rounded-lg">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {filteredMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                    location.pathname === item.path
                      ? 'bg-indigo-50 text-[#635bff] font-bold shadow-sm'
                      : 'text-[#697386] font-medium'
                  }`}
                >
                  <item.icon size={22} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 py-3 text-rose-500 font-bold">
                <LogOut size={22} />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-[#e3e8ee] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#697386] hover:bg-[#f6f9fc] rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl text-[#aab7c4] w-64 lg:w-96">
              <Search size={18} />
              <input type="text" placeholder="Buscar clientes, rutas..." className="bg-transparent border-none outline-none text-sm font-medium text-[#0a2540] w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="p-2 text-[#697386] hover:bg-[#f6f9fc] rounded-xl relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-[#e3e8ee]"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0a2540]">{user.companyName}</p>
                <p className="text-[10px] font-bold text-[#635bff] uppercase tracking-wider">{plan} plan</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-[#635bff] font-bold shadow-sm transition-all group-hover:scale-105">
                {user.fullName?.charAt(0) || user.username?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
