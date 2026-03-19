import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Zap, Layout, ArrowRight, UserPlus, FileText, Calendar } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f0fafa]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/30 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">Glassy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Precios</a>
            <a href="/login" className="hover:text-blue-600 transition-colors">Iniciar Sesión</a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-md shadow-blue-200">
              Registra tu Empresa
            </button>
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
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl">
              Prueba Gratuita 14 días <ArrowRight size={20} />
            </button>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl border border-slate-200 font-bold hover:bg-slate-50 transition-all">
              Ver Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-3xl border-8 border-white group"
          >
             {/* Simulación Dashboard */}
            <div className="w-full h-[500px] bg-white p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex gap-4">
                  <div className="w-24 h-8 bg-slate-100 rounded-lg"></div>
                  <div className="w-24 h-8 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500"></div>
              </div>
              <div className="grid grid-cols-3 gap-6 flex-1">
                <div className="p-6 rounded-2xl border border-blue-50/50 bg-blue-50/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold">
                    <UserPlus size={18} /> Clientes
                  </div>
                  <div className="text-3xl font-bold">124</div>
                </div>
                <div className="p-6 rounded-2xl border border-blue-50/50 bg-blue-50/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold">
                    <Calendar size={18} /> Rutas
                  </div>
                  <div className="text-3xl font-bold">14</div>
                </div>
                <div className="p-6 rounded-2xl border border-blue-50/50 bg-blue-50/20 backdrop-blur-sm">
                   <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold">
                    <FileText size={18} /> Facturas
                  </div>
                  <div className="text-3xl font-bold">98%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Planes diseñados para crecer</h2>
            <p className="text-slate-600 mb-16">Sin costos ocultos. Paga solo por lo que necesitas.</p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Free Trial */}
                <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col text-left">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Básico</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">29€</span>
                        <span className="text-slate-500">/ mes</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-slate-600">
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Hasta 100 Clientes</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Facturas PDF</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Soporte por Email</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl border border-slate-200 font-bold hover:bg-white transition-all">Empezar ahora</button>
                </div>

                {/* Professional */}
                <div className="p-8 rounded-3xl border-2 border-blue-500 bg-white shadow-2xl shadow-blue-100 flex flex-col text-left relative overflow-hidden scale-105">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-xs font-bold rounded-bl-xl uppercase tracking-widest">Recomendado</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Profesional</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">49€</span>
                        <span className="text-slate-500">/ mes</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-slate-600 font-medium">
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Clientes Ilimitados</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Rutas para Cristaleros</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Personalización de Logo</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Firma Digital</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Empezar ahora</button>
                </div>

                {/* Enterprise */}
                <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col text-left">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Empresa</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">99€</span>
                        <span className="text-slate-500">/ mes</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-slate-600">
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Todo lo de Profesional</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Múltiples Sedes</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> API de Integración</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Soporte 24/7</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl border border-slate-200 font-bold hover:bg-white transition-all">Contactar</button>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6 border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 grayscale brightness-200">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">G</span>
                </div>
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
