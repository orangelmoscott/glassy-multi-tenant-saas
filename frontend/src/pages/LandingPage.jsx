import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, FileText, Shield, Layout, Users, BarChart3, Smartphone, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const APP_URL = 'https://app.glassy.es';

const plans = [
  {
    name: 'Plan Básico',
    price: '29',
    desc: 'Para cristaleros independientes.',
    slug: 'basico',
    featured: false,
    features: [
      'Hasta 40 clientes',
      '1 cristalero activo',
      'Rutas con mapa y optimización',
      'Facturación incluida',
      'Soporte por email',
    ],
  },
  {
    name: 'Plan Pro',
    price: '49',
    desc: 'Para pequeñas empresas en crecimiento.',
    slug: 'pro',
    featured: true,
    features: [
      'Hasta 150 clientes',
      '5 cristaleros activos',
      'Rutas con mapa y optimización',
      '5 rutas diarias',
      'Dashboard profesional de rendimiento',
      'Módulo de facturación avanzada',
    ],
  },
  {
    name: 'Plan Business',
    price: '99',
    desc: 'Para empresas consolidadas.',
    slug: 'business',
    featured: false,
    features: [
      'Clientes ilimitados',
      'Cristaleros ilimitados',
      'Mapa logístico avanzado',
      'Facturación y dashboard adicional',
      'Dashboard de inteligencia de negocio',
      'Soporte prioritario y acceso total',
    ],
  },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
  const isLoggedIn = !!user.token;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-white/90 backdrop-blur-lg border-slate-200 shadow-sm py-3' : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635bff] to-[#4f46e5] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">G</div>
            <span className="text-xl font-black text-[#0a2540] tracking-tight">Glassy</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] transition-colors">Precios</a>
            <div className="h-4 w-px bg-slate-200"></div>
            {isLoggedIn ? (
              <Link to="/app/dashboard" className="btn-stripe-primary">Ir al Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] transition-colors">Iniciar sesión</Link>
                <Link to="/register" className="btn-stripe-primary">Prueba gratis</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-6 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#635bff] text-[11px] font-bold uppercase tracking-wider mb-6">
              Software para empresas de limpieza
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-[#0a2540] tracking-tight leading-[1.05] mb-8 max-w-4xl mx-auto"
          >
            Gestiona tu negocio de limpieza <span className="text-gradient-stripe">con precisión quirúrgica</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-[#697386] max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Glassy es la plataforma todo-en-uno que ayuda a las empresas de limpieza a optimizar sus rutas, automatizar la facturación y escalar sus operaciones sin fricción.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Link to="/register" className="btn-stripe-primary text-base px-8 py-4">
              Empieza gratis ahora <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
            <a href="#features" className="btn-stripe-ghost text-base px-8 py-4">
              Ver funcionalidades
            </a>
          </motion.div>

          {/* Interactive Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-indigo-200/50 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="ml-4 bg-white border border-slate-200 rounded px-3 py-1 text-[10px] text-slate-400 font-mono">app.glassy.es/dashboard</div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Servicios Hoy', value: '24', icon: <Zap className="text-[#635bff]" size={20} />, trend: '+12% vs ayer' },
                  { label: 'Ingresos Mes', value: '12.450€', icon: <BarChart3 className="text-[#0073e6]" size={20} />, trend: '+8.4% vs anterior' },
                  { label: 'Equipo Activo', value: '8/10', icon: <Users className="text-[#00d4ff]" size={20} />, trend: 'En ruta' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold text-[#697386] uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-[#0a2540]">{stat.value}</div>
                    <div className="text-[11px] font-semibold text-emerald-600 mt-1">{stat.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-32 bg-[#f6f9fc]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#0a2540] mb-4">Todo lo que necesitas para escalar</h2>
            <p className="text-[#697386] text-lg">Elimina el trabajo manual y céntrate en lo que importa: tus clientes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Layout className="text-[#635bff]" />, title: 'Rutas Optimizadas', desc: 'Nuestro algoritmo calcula la ruta más eficiente para tu equipo, reduciendo tiempos de desplazamiento y consumo de combustible.' },
              { icon: <FileText className="text-[#0073e6]" />, title: 'Facturación Automática', desc: 'Genera facturas profesionales al instante al terminar un servicio. Compatible con normativas fiscales locales.' },
              { icon: <Users className="text-[#00d4ff]" />, title: 'Gestión de Personal', desc: 'Asigna tareas, controla horarios y monitoriza el progreso de tus operarios en tiempo real desde un solo panel.' },
              { icon: <Smartphone className="text-[#635bff]" />, title: 'App para Operarios', desc: 'Interfaz móvil simplificada para que tu equipo vea sus servicios, direcciones y reporte incidencias al momento.' },
              { icon: <Shield className="text-[#0073e6]" />, title: 'Historial de Clientes', desc: 'Base de datos centralizada con fotos, notas específicas y frecuencias de limpieza para cada cliente.' },
              { icon: <Lock className="text-[#00d4ff]" />, title: 'Seguridad Empresarial', desc: 'Datos protegidos con cifrado bancario y copias de seguridad automáticas cada hora.' },
            ].map((f, i) => (
              <div key={i} className="stripe-card p-8">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center mb-6">{f.icon}</div>
                <h3 className="text-lg font-bold text-[#0a2540] mb-3">{f.title}</h3>
                <p className="text-sm text-[#697386] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#0a2540] mb-4">Planes diseñados para tu crecimiento</h2>
            <p className="text-[#697386] text-lg">Sin compromiso. Cambia de plan o cancela en cualquier momento.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.featured ? 'bg-[#0a2540] border-[#0a2540] shadow-2xl shadow-indigo-200 md:-translate-y-4' : 'bg-white border-[#e3e8ee] hover:border-[#c0c8d8]'
              }`}>
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#635bff] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                    Más Popular
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-[#0a2540]'}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.featured ? 'text-slate-400' : 'text-[#697386]'}`}>{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`text-5xl font-black ${plan.featured ? 'text-white' : 'text-[#0a2540]'}`}>{plan.price}€</span>
                  <span className={`text-sm font-semibold ${plan.featured ? 'text-slate-400' : 'text-[#697386]'}`}>/mes</span>
                </div>

                <Link 
                  to={isLoggedIn ? "/app/settings" : `/register?plan=${plan.slug}`} 
                  className={`block w-full text-center py-3.5 rounded-lg font-bold text-sm mb-8 transition-all ${
                    plan.featured ? 'bg-[#635bff] text-white hover:bg-[#7c74ff]' : 'bg-[#f6f9fc] text-[#0a2540] hover:bg-[#e3e8ee]'
                  }`}
                >
                  {isLoggedIn ? 'Gestionar suscripción' : 'Probar gratis 14 días'}
                </Link>

                <div className={`h-px w-full mb-8 ${plan.featured ? 'bg-white/10' : 'bg-slate-100'}`}></div>

                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${plan.featured ? 'text-[#635bff]' : 'text-emerald-500'}`} />
                      <span className={`text-sm ${plan.featured ? 'text-slate-300' : 'text-[#697386]'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#635bff] to-[#4f46e5] flex items-center justify-center text-white font-black text-lg">G</div>
                <span className="text-lg font-black text-[#0a2540]">Glassy</span>
              </div>
              <p className="text-sm text-[#697386] leading-relaxed">
                Empoderando a las empresas de limpieza con tecnología de vanguardia para una gestión eficiente y escalable.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="font-bold text-[#0a2540] mb-4 text-sm">Producto</h4>
                <ul className="space-y-3 text-sm text-[#697386]">
                  <li><a href="#features" className="hover:text-[#635bff] transition-colors">Funcionalidades</a></li>
                  <li><a href="#pricing" className="hover:text-[#635bff] transition-colors">Precios</a></li>
                  <li><Link to="/register" className="hover:text-[#635bff] transition-colors">Registro</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#0a2540] mb-4 text-sm">Empresa</h4>
                <ul className="space-y-3 text-sm text-[#697386]">
                  <li><span className="hover:text-[#635bff] transition-colors cursor-pointer">Sobre nosotros</span></li>
                  <li><span className="hover:text-[#635bff] transition-colors cursor-pointer">Contacto</span></li>
                  <li><span className="hover:text-[#635bff] transition-colors cursor-pointer">Aviso Legal</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#0a2540] mb-4 text-sm">Soporte</h4>
                <ul className="space-y-3 text-sm text-[#697386]">
                  <li><span className="hover:text-[#635bff] transition-colors cursor-pointer">Centro de Ayuda</span></li>
                  <li><span className="hover:text-[#635bff] transition-colors cursor-pointer">Estado del servicio</span></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#a0aec0]">© 2026 Glassy SaaS Platform. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-xs text-[#a0aec0]">
              <span className="hover:text-[#635bff] cursor-pointer">Privacidad</span>
              <span className="hover:text-[#635bff] cursor-pointer">Términos</span>
              <span className="hover:text-[#635bff] cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
