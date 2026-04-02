import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, UserPlus, X } from 'lucide-react';

const ReassignModal = ({ isOpen, onClose, onConfirm, message, loading }) => {
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
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
                    
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mt-4">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={32} className="text-amber-500" />
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Conflicto de Asignación</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8">{message}</p>

                        <div className="flex w-full gap-3">
                            <button 
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2 text-white font-extrabold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50 md:text-sm text-xs"
                            >
                                {loading ? 'Cambiando...' : <><UserPlus size={18}/> Sí, Reasignar</>}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReassignModal;
