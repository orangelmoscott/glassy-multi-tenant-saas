import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", loading = false }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-3xl text-center"
                    >
                        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        
                        <h2 className="text-2xl font-black text-slate-800 mb-2">{title}</h2>
                        <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed text-balance">
                            {message}
                        </p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-4 rounded-2xl font-bold border-2 border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-200 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
                            >
                                {loading ? 'Procesando...' : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
