import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Search, Phone, MapPin, 
  MoreHorizontal, Edit2, Trash2, ChevronRight, 
  Mail, ExternalLink, Filter, Plus, ShieldCheck,
  CheckCircle, History, Info, X, RefreshCcw, FileText, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import UpgradeModal from '../components/UpgradeModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        basePrice: '',
        visitFrequency: 'mensual'
    });

    const [selectedClient, setSelectedClient] = useState(null);
    const [clientAssignments, setClientAssignments] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, clientId: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, message: '', upgradeTo: '' });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/clients?isDeleted=false', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                const res = await axios.put(`https://glassy.es/api/clients/${editingClient._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients(clients.map(c => c._id === editingClient._id ? res.data : c));
            } else {
                const res = await axios.post('https://glassy.es/api/clients', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients([res.data, ...clients]);
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
        setDeleteModal({ isOpen: true, clientId: id });
    };

    const confirmDeleteClient = async () => {
        if (!deleteModal.clientId) return;
        setIsDeleting(true);
        try {
            await axios.delete(`https://glassy.es/api/clients/${deleteModal.clientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(clients.filter(c => c._id !== deleteModal.clientId));
            setDeleteModal({ isOpen: false, clientId: null });
        } catch (err) {
            alert('Error al eliminar cliente');
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (c) => {
        setEditingClient(c);
        setFormData({
            companyName: c.companyName,
            contactPerson: c.contactPerson || '',
            email: c.email || '',
            phone: c.phone || '',
            address: c.address || '',
            basePrice: c.basePrice || '',
            visitFrequency: c.visitFrequency || 'mensual'
        });
        setShowModal(true);
    };

    const fetchHistory = async (client) => {
        setSelectedClient(client);
        setLoadingDetails(true);
        try {
            const res = await axios.get(`https://glassy.es/api/assignments/client/${client._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientAssignments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClient(null);
        setFormData({ companyName: '', contactPerson: '', email: '', phone: '', address: '', basePrice: '', visitFrequency: 'mensual' });
    };

    const filteredClients = clients.filter(c => 
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Directorio de Clientes</h1>
                        <p className="text-sm text-[#697386] mt-1 font-medium italic">Gestiona tus servicios recurrentes y facturación.</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="btn-stripe-primary"
                    >
                        <Plus size={18} /> Añadir Cliente
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-8 relative">
                        <Search className="absolute left-4 top-3.5 text-[#aab7c4]" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, dirección o contacto..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] transition-all font-medium text-[#0a2540] shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="lg:col-span-4 flex gap-2">
                        <button className="flex-1 btn-stripe-secondary">
                            <Filter size={18} /> Filtrar
                        </button>
                        <div className="bg-white border border-[#e3e8ee] rounded-2xl px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-[#0a2540] shadow-sm">
                            <Users size={18} className="text-[#635bff]" />
                            {filteredClients.length} Clientes
                        </div>
                    </div>
                </div>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl border border-[#e3e8ee] animate-pulse"></div>
                        ))
                    ) : filteredClients.length === 0 ? (
                        <div className="col-span-full py-32 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0a2540]">No se encontraron clientes</h3>
                            <p className="text-[#697386] mt-2 font-medium italic">Intenta con otro término de búsqueda.</p>
                        </div>
                    ) : (
                        filteredClients.map((c) => (
                            <motion.div
                                key={c._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="stripe-card group p-8"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#635bff] border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                                        <Users size={28} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(c)} className="p-2.5 text-[#697386] hover:text-[#635bff] hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDelete(c._id)} className="p-2.5 text-[#697386] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"><Trash2 size={16}/></button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-[#0a2540] group-hover:text-[#635bff] transition-colors line-clamp-1">{c.companyName}</h3>
                                    <p className="text-sm text-[#697386] font-medium flex items-center gap-1.5">
                                        <MapPin size={14} className="text-[#635bff]" /> {c.address}
                                    </p>
                                </div>

                                <div className="my-6 grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-[#f6f9fc] rounded-xl border border-[#e3e8ee]">
                                        <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest mb-1">Frecuencia</p>
                                        <p className="text-xs font-bold text-[#0a2540] uppercase">{c.visitFrequency}</p>
                                    </div>
                                    <div className="p-3 bg-[#f6f9fc] rounded-xl border border-[#e3e8ee]">
                                        <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest mb-1">Precio Base</p>
                                        <p className="text-xs font-bold text-[#635bff]">{c.basePrice}€</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#f6f9fc] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Activo</span>
                                    </div>
                                    <button 
                                        onClick={() => fetchHistory(c)}
                                        className="text-[10px] font-bold text-[#635bff] hover:underline flex items-center gap-1"
                                    >
                                        VER HISTORIAL <ChevronRight size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Cliente */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#fcfdfe]">
                                <h2 className="text-xl font-bold text-[#0a2540]">{editingClient ? 'Actualizar Cliente' : 'Alta de Nuevo Cliente'}</h2>
                                <button onClick={closeModal} className="p-2.5 hover:bg-[#f6f9fc] rounded-xl transition-all text-[#697386] shadow-sm border border-[#e3e8ee] bg-white"><X size={20}/></button>
                            </div>
                            <div className="overflow-y-auto p-8">
                                <form onSubmit={handleAction} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-widest ml-1">Nombre Comercial / Empresa</label>
                                        <input 
                                            type="text" required placeholder="Ej: Restaurante El Prado"
                                            className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] font-bold text-[#0a2540] shadow-sm"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-widest ml-1">Contacto</label>
                                            <input 
                                                type="text" placeholder="Persona de contacto"
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none"
                                                value={formData.contactPerson}
                                                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-widest ml-1">Teléfono</label>
                                            <input 
                                                type="text" placeholder="600 000 000"
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-widest ml-1">Dirección Completa</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 text-[#aab7c4]" size={20} />
                                            <input 
                                                type="text" placeholder="Calle, número, CP y ciudad" required
                                                className="w-full pl-12 pr-4 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff]"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-widest ml-1">Frecuencia de Limpieza</label>
                                            <select 
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none font-bold text-[#0a2540] appearance-none"
                                                value={formData.visitFrequency}
                                                onChange={(e) => setFormData({...formData, visitFrequency: e.target.value})}
                                            >
                                                <option value="semanal">Semanal</option>
                                                <option value="quincenal">Quincenal</option>
                                                <option value="mensual">Mensual</option>
                                                <option value="trimestral">Trimestral</option>
                                                <option value="puntual">Servicio Puntual</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-widest ml-1">Precio por Visita (€)</label>
                                            <input 
                                                type="number" step="0.01" required
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none font-bold text-[#635bff]"
                                                value={formData.basePrice}
                                                onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full bg-[#635bff] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#0a2540] shadow-2xl shadow-indigo-100 transition-all active:scale-95 mt-4">
                                        {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Historial */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-[#0a2540]/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-[32px] w-full max-w-2xl h-full md:h-[80vh] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-[#e3e8ee] flex items-center justify-between bg-[#fcfdfe]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-[#635bff] rounded-xl flex items-center justify-center border border-indigo-100">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#0a2540]">{selectedClient.companyName}</h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <p className="text-sm text-[#697386] font-medium flex items-center gap-1.5"><MapPin size={14} className="text-[#635bff]" /> {selectedClient.address}</p>
                                            {selectedClient.serviceType && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-blue-200">
                                                    {selectedClient.serviceType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="p-2.5 text-[#697386] hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-[#e3e8ee] bg-white shadow-sm"><X size={24}/></button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 space-y-4 bg-[#f6f9fc]/30">
                                {loadingDetails ? (
                                   <div className="flex flex-col items-center justify-center py-24 gap-4">
                                       <RefreshCcw className="animate-spin text-[#635bff]" size={32} />
                                       <p className="text-sm font-bold text-[#697386] uppercase tracking-widest">Cargando historial...</p>
                                   </div>
                                ) : clientAssignments.length > 0 ? (
                                   clientAssignments.flatMap(as => {
                                       if (as.visitLogs && as.visitLogs.length > 0) {
                                           return as.visitLogs.map((log, lIdx) => ({
                                               ...as,
                                               displayDate: log.date,
                                               displayWorker: log.workerName || 'Equipo Glassy',
                                               isVisit: true,
                                               logId: `${as._id}-${lIdx}`
                                           }));
                                       }
                                       return [{
                                           ...as,
                                           displayDate: as.date,
                                           displayWorker: as.workerId?.fullName || 'Equipo Glassy',
                                           isVisit: false,
                                           logId: as._id
                                       }];
                                   })
                                   .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
                                   .map((entry) => {
                                        const totalPrice = (entry.price || 0) + (entry.extraServices ? entry.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0);
                                        return (
                                            <div key={entry.logId} className="bg-white p-6 rounded-2xl border border-[#e3e8ee] flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:shadow-md transition-all group gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${entry.status === 'completado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#0a2540] text-base">
                                                            {new Date(entry.displayDate).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-[#697386] uppercase tracking-widest bg-[#f6f9fc] px-2.5 py-1 rounded-lg border border-[#e3e8ee]">{entry.displayWorker}</span>
                                                            {entry.isVisit && <span className="text-[10px] bg-indigo-50 text-[#635bff] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border border-indigo-100">VISITA EXTRA</span>}
                                                        </div>
                                                        {entry.notes && (
                                                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group/note">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-[#635bff]"></div>
                                                                <p className="text-[9px] font-bold text-[#635bff] uppercase tracking-widest mb-1 opacity-80">Motivo del servicio:</p>
                                                                <p className="text-xs text-[#0a2540] font-medium italic leading-relaxed">
                                                                    "{entry.notes}"
                                                                </p>
                                                            </div>
                                                        )}
                                                        {entry.extraServices?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {entry.extraServices.map((ex, i) => (
                                                                    <span key={i} className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold border border-emerald-100 uppercase tracking-tighter">
                                                                        + {ex.description}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end gap-2 md:gap-1">
                                                    <p className="font-bold text-[#0a2540] text-lg">{totalPrice.toFixed(2)}€</p>
                                                    <button 
                                                        onClick={async (e) => {
                                                            const btn = e.currentTarget;
                                                            const prevContent = btn.innerHTML;
                                                            try {
                                                                btn.innerText = 'GENERANDO...';
                                                                const response = await axios.get(`https://glassy.es/api/assignments/${entry._id}/invoice`, {
                                                                    headers: { Authorization: `Bearer ${token}` },
                                                                    responseType: 'blob'
                                                                });
                                                                const url = window.URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
                                                                window.open(url, '_blank');
                                                            } catch (err) {
                                                                alert('Error al generar PDF.');
                                                            } finally {
                                                                btn.innerHTML = prevContent;
                                                            }
                                                        }}
                                                        className="text-[10px] text-[#635bff] font-bold hover:text-[#0a2540] transition-colors uppercase tracking-widest flex items-center gap-1.5 justify-end bg-white border border-[#e3e8ee] md:border-none px-3 py-2 md:p-0 rounded-lg md:rounded-none shadow-sm md:shadow-none"
                                                    >
                                                        <FileText size={14} /> Factura PDF
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                   })
                                ) : (
                                   <div className="text-center py-24 opacity-30 flex flex-col items-center">
                                       <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                           <History size={40} />
                                       </div>
                                       <p className="text-sm font-bold uppercase tracking-widest">Sin registros de servicio.</p>
                                   </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, clientId: null })}
                onConfirm={confirmDeleteClient}
                title="¿Eliminar cliente?"
                message="Esta acción no se puede deshacer. Se mantendrán los históricos de facturación pero el cliente dejará de aparecer en las rutas."
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

export default Clients;
