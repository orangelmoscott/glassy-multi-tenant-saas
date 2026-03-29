import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Sparkles, Zap, Shield, HelpCircle, RefreshCcw } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, currentPlan, onSelectPlan }) => {
  const [loadingPlan, setLoadingPlan] = React.useState(null);

  if (!isOpen) return null;

  const handleSelect = async (planId) => {
    if (planId === currentPlan) return;
    setLoadingPlan(planId);
    try {
        await onSelectPlan(planId);
    } catch (err) {
        console.error(err);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-5xl shadow-3xl overflow-hidden relative z-10 flex flex-col md:flex-row"
        >
          {/* Header (Móvil) / Sidebar (Desktop) */}
          <div className="md:w-1/3 bg-slate-50 p-10 border-r border-slate-100 flex flex-col justify-between">
            <div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                    <Sparkles size={24} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight mb-4">Eleva tu negocio con Glassy</h2>
                <p className="text-slate-500 leading-relaxed mb-8">Elige el plan que mejor se adapte al tamaño de tu cartera de clientes y empieza a automatizar.</p>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <Zap size={18} className="text-amber-500" /> Sin comisiones por transacción
                    </div>
                     <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <Shield size={18} className="text-blue-500" /> Cancelación en cualquier momento
                    </div>
                </div>
            </div>
            
            <div className="mt-12 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"> <HelpCircle size={14}/> ¿Necesitas ayuda?</div>
                <p className="text-xs text-slate-500">Nuestro equipo de soporte está disponible para migrar tus datos actuales.</p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="md:w-2/3 p-10 overflow-y-auto max-h-[80vh]">
             <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
             </button>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((p) => (
                    <div 
                        key={p.id}
                        className={`p-6 rounded-2xl border transition-all flex flex-col
                        ${p.highlight ? 'border-blue-500 bg-blue-50/10 shadow-xl scale-[1.03] ring-4 ring-blue-500/5' : 'border-slate-100 bg-white hover:border-slate-300'}
                        ${p.current ? 'opacity-50 ring-2 ring-slate-200 pointer-events-none' : ''}
                        `}
                    >
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">{p.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                            <span className="text-slate-500 text-xs font-medium">/ mes</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {p.features.map(f => (
                                <li key={f} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                    <Check size={14} className="text-blue-500 shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button 
                            disabled={p.current || !!loadingPlan}
                            onClick={() => handleSelect(p.id)}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2
                            ${p.highlight ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-200 hover:shadow-lg' : 'bg-slate-900 text-white hover:bg-slate-800'}
                            ${(p.current || !!loadingPlan) ? 'opacity-70 cursor-not-allowed' : ''}
                        `}>
                            {loadingPlan === p.id && <RefreshCcw size={16} className="animate-spin" />}
                            {p.current ? 'Tu Plan Actual' : p.cta}
                        </button>
                    </div>
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricingModal;
