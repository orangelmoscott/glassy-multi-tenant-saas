import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-[30px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mt-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle size={32} className="text-blue-500" />
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">{title || 'Atención'}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8">{message}</p>

                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            Entendido
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AlertModal;
