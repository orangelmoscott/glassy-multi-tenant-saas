import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Zap, ArrowRight, FileText, Star, MapPin } from 'lucide-react';

const CityLandingTemplate = () => {
  const { ciudad } = useParams();
  
  const cityName = ciudad
    ? ciudad.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'tu ciudad';

  useEffect(() => {
    document.title = `Software para Empresas de Limpieza de Cristales en ${cityName} | Glassy`;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Si tienes una empresa de limpieza en ${cityName}, Glassy es el software nº1 para organizar rutas y facturar. Optimiza el trabajo de tus cristaleros en ${cityName}.`);
    }
  }, [cityName]);

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e3e8ee]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#635bff] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                <img src="/favicon.png" alt="Glassy" className="w-6 h-6 brightness-0 invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0a2540]">Glassy</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-[#697386] hover:text-[#0a2540] transition-colors">Iniciar sesión</Link>
            <Link to="/register">
                <button className="bg-[#635bff] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#4f46e5] transition-all shadow-lg shadow-indigo-100">
                Prueba gratis
                </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <span className="bg-indigo-50 text-[#635bff] px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
              <MapPin size={14} /> SOLUCIÓN LOCAL PARA CRISTALEROS EN {cityName.toUpperCase()}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-[#0a2540] leading-[1.1] mb-8"
          >
            Software de limpieza de cristales en <span className="text-[#635bff]">{cityName}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#425466] max-w-2xl mb-12 font-medium leading-relaxed"
          >
            Si tienes una empresa de limpieza en {cityName}, Glassy es la herramienta diseñada para ayudarte a facturar más y trabajar menos. Rutas inteligentes y gestión profesional en tu ciudad.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/register">
                <button className="bg-[#0a2540] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#1a3f6d] transition-all shadow-xl active:scale-95">
                Empezar prueba en {cityName} <ArrowRight size={20} />
                </button>
            </Link>
            <div className="flex items-center gap-2 px-6 py-4">
                <div className="flex text-amber-400"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                <span className="text-sm font-bold text-[#697386]">4.9/5 valoración local</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 bg-white border-y border-[#e3e8ee]">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center md:text-left space-y-2">
                  <h4 className="text-4xl font-bold text-[#635bff]">35%</h4>
                  <p className="text-[#697386] font-bold text-sm uppercase tracking-wider">Ahorro en rutas en {cityName}</p>
              </div>
              <div className="text-center md:text-left space-y-2">
                  <h4 className="text-4xl font-bold text-[#635bff]">+12h</h4>
                  <p className="text-[#697386] font-bold text-sm uppercase tracking-wider">Recuperadas mensualmente</p>
              </div>
              <div className="text-center md:text-left space-y-2">
                  <h4 className="text-4xl font-bold text-[#635bff]">100%</h4>
                  <p className="text-[#697386] font-bold text-sm uppercase tracking-wider">Facturación sin errores</p>
              </div>
          </div>
      </section>
      
      {/* Features */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] mb-4">Optimizado para el cristalero local</h2>
            <p className="text-[#697386] font-medium max-w-xl mx-auto italic">Diseñado por y para empresas de limpieza que buscan profesionalizar su operativa diaria en {cityName}.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="stripe-card p-10 bg-white group hover:border-[#635bff] transition-all">
                <div className="w-14 h-14 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                    <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-4">Rutas Inteligentes</h3>
                <p className="text-[#425466] leading-relaxed text-sm">Organiza a tus operarios por las calles de {cityName} de forma eficiente. Reduce tiempos de desplazamiento y costes de combustible.</p>
            </div>
            
            <div className="stripe-card p-10 bg-white group hover:border-[#635bff] transition-all">
                <div className="w-14 h-14 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                    <FileText size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-4">Facturación Pro</h3>
                <p className="text-[#425466] leading-relaxed text-sm">Genera facturas PDF profesionales al instante. Adaptado a la fiscalidad española para que no pierdas ni un minuto más con Excel.</p>
            </div>
            
            <div className="stripe-card p-10 bg-white group hover:border-[#635bff] transition-all">
                <div className="w-14 h-14 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                    <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-4">Control Total</h3>
                <p className="text-[#425466] leading-relaxed text-sm">Toda la base de datos de tus clientes comerciales de {cityName} segura y organizada. Historial de servicios, firmas y fotos en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#0a2540] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Lleva tu empresa en {cityName} al siguiente nivel</h2>
            <Link to="/register">
                <button className="bg-[#635bff] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#4f46e5] transition-all shadow-2xl active:scale-95">
                    Probar Glassy Gratis Ahora
                </button>
            </Link>
            <p className="mt-6 text-white/50 text-sm font-medium">Sin tarjeta de crédito. Cancela cuando quieras.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e3e8ee] py-12">
         <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <img src="/favicon.png" alt="Glassy" className="w-6 h-6" />
                <span className="font-bold text-[#0a2540]">Glassy</span>
            </div>
            <p className="text-xs text-[#697386] font-medium">&copy; 2026 Glassy. Software especializado para cristaleros en {cityName} y toda España.</p>
         </div>
      </footer>
    </div>
  );
};

export default CityLandingTemplate;
