import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Zap, Layout, ArrowRight, UserPlus, FileText, Calendar } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const LandingPage = () => {
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
  const isLoggedIn = !!user.token;

  return (
    <div className="min-h-screen bg-[#f0fafa]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/30 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Glassy Icon" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-slate-800">Glassy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Precios</a>
            <Link to="/login" className="hover:text-blue-600 transition-colors">Iniciar Sesión</Link>
            <Link to="/register">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-md shadow-blue-200">
                Registra tu Empresa
                </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="bg-blue-100/50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-200">
              La revolución para tu empresa de limpieza
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
          >
            Gestiona tu negocio con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Claridad</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed"
          >
            Glassy es la plataforma multi-empresa todo-en-uno diseñada para optimizar rutas de cristaleros, automatizar facturación y fidelizar clientes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-20"
          >
            <Link to="/register?plan=autonomo">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl">
                Prueba Gratuita 7 días <ArrowRight size={20} />
                </button>
            </Link>
            <Link to="/register">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl border border-slate-200 font-bold hover:bg-slate-50 transition-all">
                Ver Demo
                </button>
            </Link>
          </motion.div>

          {/* ... resto del dashboard sim ... */}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Planes diseñados para crecer</h2>
            <p className="text-slate-600 mb-16">Sin costos ocultos. Paga solo por lo que necesitas.</p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
                {/* Autónomo */}
                <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 flex flex-col text-left hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Plan Autónomo</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10">Para cristaleros independientes.</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">29€</span>
                        <span className="text-slate-500">/ mes</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-slate-600 text-sm">
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>Hasta 40 Clientes</span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>1 Cristalero Activo</span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>1 Ruta Diaria</span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>Facturación Automática por Email</span></li>
                    </ul>
                    <Link to={isLoggedIn ? "/app/settings" : "/register?plan=autonomo"} className="w-full">
                        <button className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold hover:bg-white transition-all text-slate-700">Empezar Plan</button>
                    </Link>
                </div>

                {/* Pro */}
                <div className="p-8 rounded-3xl border-2 border-blue-500 bg-white shadow-2xl shadow-blue-100/50 flex flex-col text-left relative overflow-hidden md:scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-cyan-500 text-white px-4 py-1.5 text-[10px] font-bold rounded-bl-xl uppercase tracking-widest shadow-sm">El más popular</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Plan Pro</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10">Para pequeñas empresas en crecimiento.</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-extrabold text-slate-900">49€</span>
                        <span className="text-slate-500 font-medium whitespace-nowrap">/ mes</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-slate-700 font-medium text-sm">
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>Hasta 150 Clientes</span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>5 Cristaleros Activos</span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>5 Rutas Diarias</span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5"/> <span>Dashboard Multi-trabajador</span></li>
                    </ul>
                    <Link to={isLoggedIn ? "/app/settings" : "/register?plan=pro"} className="w-full">
                        <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 active:scale-95">Empezar Plan</button>
                    </Link>
                </div>

                {/* Business */}
                <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50 flex flex-col text-left hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Plan Business</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10">Para empresas consolidadas.</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">99€</span>
                        <span className="text-slate-500">/ mes</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-slate-600 text-sm">
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-slate-800 shrink-0 mt-0.5"/> <span><strong className="text-slate-800">Clientes Ilimitados</strong></span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-slate-800 shrink-0 mt-0.5"/> <span><strong className="text-slate-800">Cristaleros Ilimitados</strong></span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-slate-800 shrink-0 mt-0.5"/> <span><strong className="text-slate-800">Rutas Ilimitadas</strong></span></li>
                        <li className="flex items-start gap-2"><CheckCircle size={18} className="text-slate-800 shrink-0 mt-0.5"/> <span>Soporte prioritario y acceso total</span></li>
                    </ul>
                    <Link to={isLoggedIn ? "/app/settings" : "/register?plan=business"} className="w-full">
                        <button className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold hover:bg-white text-slate-700 transition-all">Empezar Plan</button>
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6 border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="Glassy Icon" className="h-8 w-8 object-contain grayscale brightness-200" />
                <span className="text-xl font-bold tracking-tight">Glassy</span>
            </div>
            <div className="text-slate-500 text-sm">
                &copy; 2026 Glassy SaaS Platform. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
