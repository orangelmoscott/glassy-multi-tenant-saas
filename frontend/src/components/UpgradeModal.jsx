import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ isOpen, onClose, message, upgradeTo }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate('/app/settings'); // Assuming Billing is part of settings, or navigate to '/app/billing' if it exists.
        // Actually, looking at the app routes usually '/app/settings' is the place. We'll send them there.
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-3xl text-center relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/30">
                            {upgradeTo === 'business' ? <Crown size={40} /> : <Rocket size={40} />}
                        </div>
                        
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Límite Alcanzado</h2>
                        <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed text-balance">
                            {message || "Has alcanzado el límite de tu plan actual. Para seguir creciendo, mejora tu suscripción."}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleUpgrade}
                                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center gap-2 group"
                            >
                                <span>Ver Planes Superiores</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Quizás más tarde
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
