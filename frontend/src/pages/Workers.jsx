import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Phone, Shield, Search, 
  Key, Save, X, RefreshCcw, Smile, HardHat, Trash2, Edit2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import UpgradeModal from '../components/UpgradeModal';

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
    const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, message: '', upgradeTo: '' });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/users/workers', {
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
                const res = await axios.patch(`https://glassy.es/api/users/workers/${editingWorker._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkers(workers.map(w => w._id === editingWorker._id ? res.data : w));
            } else {
                const res = await axios.post('https://glassy.es/api/users/workers', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkers([...workers, res.data]);
            }
            closeModal();
        } catch (err) {
            if (err.response?.data?.error === 'PLAN_LIMIT_REACHED') {
                setUpgradeModal({ 
                    isOpen: true, 
                    message: err.response.data.message, 
                    upgradeTo: err.response.data.upgrade_to 
                });
                closeModal();
            } else {
                alert(err.response?.data?.message || 'Error en la operación');
            }
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, workerId: id });
    };

    const confirmDeleteWorker = async () => {
        if (!deleteModal.workerId) return;
        setIsDeleting(true);
        try {
            await axios.delete(`https://glassy.es/api/users/workers/${deleteModal.workerId}`, {
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
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Operarios</h1>
                        <p className="text-sm text-[#697386] mt-1">Gestión de accesos y perfiles del equipo de campo.</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-[#635bff] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#4f46e5] transition-all shadow-lg shadow-indigo-100"
                    >
                        <UserPlus size={18} /> Nuevo Operario
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-xl border border-[#e3e8ee] animate-pulse shadow-sm"></div>)
                    ) : workers.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-[#697386] italic text-sm">No hay operarios registrados.</div>
                    ) : (
                        workers.map(w => (
                            <motion.div
                                key={w._id}
                                layout
                                className="stripe-card group p-6"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#635bff] border border-indigo-100 shadow-sm">
                                        <Smile size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(w)} className="p-2 text-[#697386] hover:text-[#635bff] hover:bg-[#f6f9fc] rounded-lg transition-all"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDelete(w._id)} className="p-2 text-[#697386] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-[#0a2540] mb-1">{w.fullName}</h3>
                                <p className="text-xs text-[#697386] font-semibold flex items-center gap-1.5 mb-6 uppercase tracking-wider">
                                     <Shield size={12} className="text-[#635bff]" /> ID: {w.username}
                                </p>
                                
                                <div className="pt-4 border-t border-[#f6f9fc] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#425466]">
                                        <Phone size={14} className="text-[#635bff]" /> {w.phone || 'Sin telf.'}
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-100">Activo</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showAddForm && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[#0a2540]">{editingWorker ? 'Editar Operario' : 'Alta de Operario'}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-[#f6f9fc] rounded-lg transition-all text-[#697386]"><X size={20}/></button>
                            </div>
                            <div className="overflow-y-auto p-6">
                            <form onSubmit={handleAction} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase">Nombre Completo</label>
                                    <input 
                                        type="text" required placeholder="Ej: Roberto Alcaraz"
                                        value={formData.fullName}
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase">Usuario</label>
                                        <input 
                                            type="text" required disabled={editingWorker}
                                            value={formData.username}
                                            className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540] disabled:opacity-40" 
                                            onChange={(e) => setFormData({...formData, username: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase">{editingWorker ? 'Nueva Pass' : 'Contraseña'}</label>
                                        <input 
                                            type="password" required={!editingWorker}
                                            className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold" 
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase">Teléfono Movil</label>
                                    <input 
                                        type="text" value={formData.phone}
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none" 
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                    />
                                </div>
                                <button className="w-full bg-[#635bff] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#4f46e5] shadow-lg shadow-indigo-100 transition-all mt-4">
                                    {editingWorker ? 'Guardar Cambios' : 'Registrar Operario'}
                                </button>
                            </form>
                            </div>
                        </motion.div>
                   </div>
                )}
            </AnimatePresence>
            
            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, workerId: null })}
                onConfirm={confirmDeleteWorker}
                title="¿Eliminar operario?"
                message="Se revocará el acceso inmediatamente."
                confirmText="Eliminar"
                loading={isDeleting}
            />
            
            <UpgradeModal
                isOpen={upgradeModal.isOpen}
                onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
                message={upgradeModal.message}
                upgradeTo={upgradeModal.upgradeTo}
            />
        </DashboardLayout>
    );
};

export default Workers;
