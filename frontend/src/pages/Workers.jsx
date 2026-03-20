import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Phone, Shield, Search, 
  Key, Save, X, RefreshCcw, Smile, HardHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        phone: ''
    });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get('https://glassy-backend.onrender.com/users/workers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://glassy-backend.onrender.com/users/workers', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers([...workers, res.data]);
            setShowAddForm(false);
            setFormData({ username: '', password: '', fullName: '', phone: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear operario');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <HardHat className="text-blue-600" size={32} /> Operarios y Personal
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Gestiona el equipo que realiza las rutas de limpieza.</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 shadow-xl"
                    >
                        <UserPlus size={20} /> Añadir Operario
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>)
                    ) : (
                        workers.map(w => (
                            <motion.div
                                key={w._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white mb-6 transition-all">
                                    <Smile size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{w.fullName}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                     <Key size={12} className="text-blue-500" /> user: {w.username}
                                </div>
                                
                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Phone size={14} className="text-slate-300" /> {w.phone || 'S/T'}
                                    </div>
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Activo</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Registro */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-3xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-extrabold text-slate-800">Alta de Operario</h2>
                                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input 
                                        type="text" required placeholder="Ej: Juan Pérez"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario (Login)</label>
                                        <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, username: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                        <input type="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-4 text-slate-300" size={20} />
                                        <input type="text" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                                <button className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-extrabold mt-4 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">Crear Acceso de Operario</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Workers;
