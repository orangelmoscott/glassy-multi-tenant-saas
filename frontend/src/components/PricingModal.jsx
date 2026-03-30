import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Sparkles, Zap, Shield, HelpCircle, RefreshCcw } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, currentPlan, onSelectPlan }) => {
  const [loadingPlan, setLoadingPlan] = React.useState(null);
  const [errorStatus, setErrorStatus] = React.useState(null);

  if (!isOpen) return null;

  const handleSelect = async (planId) => {
    if (planId === currentPlan) return;
    setErrorStatus(null);
    setLoadingPlan(planId);
    try {
        await onSelectPlan(planId);
    } catch (err) {
        console.error(err);
        setErrorStatus("No se pudo iniciar el pago. Reintentalo en unos segundos.");
    } finally {
        setLoadingPlan(null);
    }
  };

  const plans = [
    {
        id: 'autonomo',
        name: 'Plan Autónomo',
        price: '29€',
        description: 'Ideal para operarios independientes.',
        features: ['Hasta 40 Clientes', '1 Cristalero / 1 Ruta', 'Facturación Automática', 'IVA 21% Desglosado'],
        cta: 'Suscribirse al Autónomo',
        color: 'from-blue-600 to-indigo-500',
        current: currentPlan === 'autonomo'
    },
    {
        id: 'pro',
        name: 'Plan Pro',
        price: '49€',
        description: 'Perfecto para equipos en crecimiento.',
        features: ['Hasta 150 Clientes', '5 Cristaleros / 5 Rutas', 'Gestión Avanzada', 'Soporte Premium'],
        cta: 'Obtener Plan Pro',
        color: 'from-indigo-600 to-cyan-500',
        highlight: true,
        current: currentPlan === 'pro'
    },
    {
        id: 'business',
        name: 'Plan Business',
        price: '99€',
        description: 'Para flotas y grandes empresas.',
        features: ['Clientes Ilimitados', 'Cristaleros Ilimitados', 'Todas las Funciones', 'Soporte 24/7'],
        cta: 'Obtener Plan Business',
        color: 'from-slate-900 to-slate-700',
        current: currentPlan === 'business'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-6xl shadow-3xl overflow-hidden relative z-10 flex flex-col md:flex-row border border-white/20"
        >
          {/* Header (Móvil) / Sidebar (Desktop) */}
          <div className="md:w-1/3 bg-slate-50 p-10 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600 shadow-inner">
                    <Sparkles size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 leading-[1.1] mb-6 tracking-tight">Escala tu negocio con Glassy</h2>
                <p className="text-slate-500 leading-relaxed mb-10 text-lg font-medium italic">"La herramienta definitiva para la gestión de rutas y limpieza de cristales."</p>
                <div className="space-y-5">
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-700 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                           <Zap size={20} fill="currentColor" />
                        </div>
                        Sin comisiones ocultas
                    </div>
                     <div className="flex items-center gap-4 text-sm font-bold text-slate-700 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                         <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                           <Shield size={20} fill="currentColor" />
                        </div>
                        Cancela cuando quieras
                    </div>
                </div>
            </div>
            
            <div className="mt-12 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-3"> <HelpCircle size={16}/> SOPORTE TÉCNICO</div>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">¿Tienes dudas sobre los límites? Escríbenos y te ayudaremos con la migración de tu cartera.</p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="md:w-2/3 p-12 overflow-y-auto max-h-[90vh] bg-white relative">
             <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all shadow-sm bg-white border border-slate-50 z-20">
                <X size={24} />
             </button>

             {errorStatus && (
                 <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 font-bold flex items-center gap-4 shadow-lg shadow-red-200/20"
                 >
                    <X className="bg-red-500 text-white p-1 rounded-lg" size={20} />
                    {errorStatus}
                 </motion.div>
             )}

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((p) => (
                    <div 
                        key={p.id}
                        className={`p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col group relative
                        ${p.highlight ? 'border-blue-500 bg-blue-50/5 shadow-2xl scale-[1.05] z-10' : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:shadow-xl hover:bg-white'}
                        ${p.current ? 'opacity-60 ring-4 ring-slate-100 pointer-events-none grayscale-[0.5]' : ''}
                        `}
                    >
                        {p.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30">
                                Recomendado
                            </div>
                        )}
                        
                        <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors tracking-tight">{p.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{p.price}</span>
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">/ mes</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {p.features.map(f => (
                                <li key={f} className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                       <Check size={12} className="text-blue-600 stroke-[3]" />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button 
                            disabled={p.current || !!loadingPlan}
                            onClick={() => handleSelect(p.id)}
                            className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                            ${p.id === 'business' ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200 ring-4 ring-transparent hover:ring-slate-900/10' : 
                              p.highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200 hover:shadow-blue-300' : 
                              'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white'}
                            ${(p.current || !!loadingPlan) ? 'opacity-70 cursor-wait' : ''}
                        `}>
                            {loadingPlan === p.id ? (
                                <>
                                    <RefreshCcw size={18} className="animate-spin" />
                                    <span>CONECTANDO...</span>
                                </>
                            ) : p.current ? (
                                <>
                                    <Check size={18} />
                                    <span>TU PLAN ACTUAL</span>
                                </>
                            ) : (
                                <>
                                    <span>{p.cta}</span>
                                    <CreditCard size={18} className="opacity-40" />
                                </>
                            )}
                        </button>
                    </div>
                ))}
             </div>
             
             <p className="mt-12 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Facturación segura procesada por Stripe &copy; 2024</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricingModal;
