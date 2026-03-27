import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Phone, Shield, Search, 
  Key, Save, X, RefreshCcw, Smile, HardHat, Trash2, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        phone: ''
    });
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, workerId: null });
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            if (editingWorker) {
                const res = await axios.patch(`https://glassy-backend.onrender.com/users/workers/${editingWorker._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkers(workers.map(w => w._id === editingWorker._id ? res.data : w));
                alert('Operario actualizado con éxito');
            } else {
                const res = await axios.post('https://glassy-backend.onrender.com/users/workers', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkers([...workers, res.data]);
                alert('Operario creado con éxito');
            }
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Error en la operación');
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, workerId: id });
    };

    const confirmDeleteWorker = async () => {
        if (!deleteModal.workerId) return;
        setIsDeleting(true);
        try {
            await axios.delete(`https://glassy-backend.onrender.com/users/workers/${deleteModal.workerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(workers.filter(w => w._id !== deleteModal.workerId));
            setDeleteModal({ isOpen: false, workerId: null });
        } catch (err) {
            alert('Error al eliminar operario');
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (w) => {
        setEditingWorker(w);
        setFormData({ username: w.username, password: '', fullName: w.fullName, phone: w.phone });
        setShowAddForm(true);
    };

    const closeModal = () => {
        setShowAddForm(false);
        setEditingWorker(null);
        setFormData({ username: '', password: '', fullName: '', phone: '' });
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <HardHat className="text-blue-600" size={32} /> Squad de Operarios
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Gestiona los accesos y perfiles de tu equipo de campo.</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 shadow-xl active:scale-95"
                    >
                        <UserPlus size={20} /> Nuevo Operario
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[35px] animate-pulse"></div>)
                    ) : workers.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-30 italic">No hay operarios registrados en tu empresa.</div>
                    ) : (
                        workers.map(w => (
                            <motion.div
                                key={w._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <Smile size={32} />
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(w)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDelete(w._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1">{w.fullName}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                     <Shield size={12} className="text-blue-500" /> ID: {w.username}
                                </div>
                                
                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Phone size={14} className="text-blue-400" /> {w.phone || 'N/A'}
                                    </div>
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100 italic">Activo</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showAddForm && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-3xl overflow-hidden relative">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-800">{editingWorker ? 'Modificar Perfil' : 'Dar de Alta Operario'}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
                            </div>
                            <form onSubmit={handleAction} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input 
                                        type="text" required placeholder="Ej: Roberto Alcaraz"
                                        value={formData.fullName}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all"
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario (Inválido edit)</label>
                                        <input 
                                            type="text" required disabled={editingWorker}
                                            value={formData.username}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold disabled:opacity-50" 
                                            onChange={(e) => setFormData({...formData, username: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{editingWorker ? 'Nueva Contraseña (opc)' : 'Contraseña'}</label>
                                        <input 
                                            type="password" required={!editingWorker}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" 
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                                    <input 
                                        type="text" value={formData.phone}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" 
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                    />
                                </div>
                                <button className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black mt-6 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest text-sm">
                                    {editingWorker ? 'Actualizar Datos' : 'Autorizar Nuevo Acceso'}
                                </button>
                            </form>
                        </motion.div>
                   </div>
                )}
            </AnimatePresence>
            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, workerId: null })}
                onConfirm={confirmDeleteWorker}
                title="¿Eliminar este operario?"
                message="Esta acción revocará el acceso del trabajador al sistema y lo ocultará de tus listas. Sus servicios pasados permanecerán en el historial."
                confirmText="Sí, Eliminar Operario"
                loading={isDeleting}
            />
        </DashboardLayout>
    );
};

export default Workers;
