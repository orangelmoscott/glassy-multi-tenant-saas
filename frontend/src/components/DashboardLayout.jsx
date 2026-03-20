import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, FileText, Settings, LogOut, 
  Menu, X, Bell, LayoutDashboard, ChevronRight,
  TrendingUp, CreditCard, Sparkles, Building
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock de datos de sesión - En real vendría del AuthContext o localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    if (!user.token) {
      // navigate('/login');
    }
    setTenantData({
      companyName: user.companyName || 'Empresa Test',
      plan: user.plan || 'starter',
      logo: user.logo || null
    });
  }, []);

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/app' },
    { title: 'Clientes', icon: <Users size={20} />, path: '/app/clients' },
    { title: 'Rutas', icon: <Calendar size={20} />, path: '/app/assignments', locked: ['starter', 'basico'].includes(tenantData?.plan) },
    { title: 'Facturación', icon: <FileText size={20} />, path: '/app/billing' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('glassy_user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-white flex flex-col relative z-50 shadow-2xl"
      >
        <div className="p-4 py-8 flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                <span className="text-white font-bold text-xl">G</span>
            </div>
            {sidebarOpen && <span className="text-2xl font-bold tracking-tight">Glassy</span>}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative group
                ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'}
              `}
            >
              <div className="shrink-0">{item.icon}</div>
              {sidebarOpen && (
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium whitespace-nowrap">{item.title}</span>
                  {item.locked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <TrendingUp size={14} className="text-amber-400" />
                    </motion.div>
                  )}
                </div>
              )}
              {!sidebarOpen && (
                <div className="absolute left-20 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm invisible group-hover:visible whitespace-nowrap z-50">
                   {item.title}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Plan Status Section */}
        {sidebarOpen && (
            <div className="m-4 p-4 rounded-2xl bg-white/5 border border-white/10 mt-auto mb-8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Plan actual</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tenantData?.plan === 'starter' ? 'bg-slate-700 text-slate-300' : 'bg-blue-500 text-white'}`}>
                        {tenantData?.plan}
                    </span>
                </div>
                {tenantData?.plan === 'starter' && (
                    <button className="w-full bg-gradient-to-r from-amber-500 to-orange-400 text-white text-xs font-bold py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Upgrade a Pro
                    </button>
                )}
            </div>
        )}

        <div className="p-4 border-t border-white/5 space-y-2">
            <Link to="/app/settings" className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Settings size={20} />
                {sidebarOpen && <span>Configuración</span>}
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all">
                <LogOut size={20} />
                {sidebarOpen && <span>Cerrar Sesión</span>}
            </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-6 ml-auto">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">{tenantData?.companyName}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gestión Central</span>
             </div>
             <Link to="/app/settings" className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:ring-4 ring-blue-500/10 transition-all">
                {tenantData?.logo ? (
                  <img src={tenantData.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building size={20} className="text-slate-400" />
                )}
             </Link>
             <div className="w-px h-8 bg-slate-200"></div>
             <div className="p-2 text-slate-400 cursor-pointer hover:text-blue-500">
                <Bell size={22} />
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
