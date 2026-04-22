import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Zap, ArrowRight, FileText } from 'lucide-react';

const CityLandingTemplate = () => {
  const { ciudad } = useParams();
  
  // Capitalizar la ciudad (ej: madrid -> Madrid, las-palmas -> Las Palmas)
  const cityName = ciudad
    ? ciudad.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'tu ciudad';

  useEffect(() => {
    // GEO / SEO: Actualizar dinámicamente el título y la meta descripción
    document.title = `Software para Empresas de Limpieza de Cristales en ${cityName} | Glassy`;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Si tienes una empresa de limpieza en ${cityName}, Glassy es el software nº1 para organizar rutas y facturar. Optimiza el trabajo de tus cristaleros en ${cityName}.`);
    }
  }, [cityName]);

  return (
    <div className="min-h-screen bg-[#f0fafa]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/30 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="Glassy Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-slate-800">Glassy</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/register">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md">
                Prueba Gratuita
                </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className="bg-blue-100/50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-200">
              SOLUCIÓN LOCAL PARA CRISTALEROS EN {cityName.toUpperCase()}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-8">
            El mejor software de limpieza de cristales en <span className="text-blue-600">{cityName}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-600 max-w-3xl mb-12">
            Si tienes una empresa de limpieza en {cityName}, Glassy es la herramienta que necesitas para organizar tus rutas por el centro y los barrios, automatizar facturas y ahorrar horas de gestión.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex gap-4">
            <Link to="/register?plan=basico">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl">
                Empezar prueba en {cityName} <ArrowRight size={20} />
                </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats / GEO Trust Signals (Important for AI SEO) */}
      <section className="py-12 bg-white border-y border-slate-100">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                  <h4 className="text-4xl font-extrabold text-blue-600 mb-2">35%</h4>
                  <p className="text-slate-600 font-medium">Ahorro en tiempo de rutas en {cityName}</p>
              </div>
              <div>
                  <h4 className="text-4xl font-extrabold text-blue-600 mb-2">+10h</h4>
                  <p className="text-slate-600 font-medium">Semanales recuperadas en gestión</p>
              </div>
              <div>
                  <h4 className="text-4xl font-extrabold text-blue-600 mb-2">100%</h4>
                  <p className="text-slate-600 font-medium">Facturación automatizada</p>
              </div>
          </div>
      </section>
      
      {/* Features */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-12">¿Por qué las empresas de limpieza en {cityName} nos eligen?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <Zap className="text-blue-600 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-3">Rutas Optimizadas</h3>
                <p className="text-slate-600">Calculamos la ruta más rápida para tus operarios entre cliente y cliente en {cityName}, evitando el tráfico innecesario.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <FileText className="text-blue-600 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-3">Facturación Local</h3>
                <p className="text-slate-600">Emite facturas adaptadas a la normativa española al instante. Ahorra tiempo en papeleo mensual.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <Shield className="text-blue-600 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-3">Gestión de Clientes</h3>
                <p className="text-slate-600">Mantén una base de datos de todos tus clientes comerciales y particulares de {cityName} en un solo lugar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 text-center">
         <p>&copy; 2026 Glassy. Software especializado para cristaleros en {cityName} y toda España.</p>
      </footer>
    </div>
  );
};

export default CityLandingTemplate;
