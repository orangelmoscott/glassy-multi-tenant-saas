import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, 
  Trash2, Edit2, FileText, TrendingUp, AlertCircle, CheckCircle2, X, MapPin, ChevronRight, Briefcase, Plus, Phone, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import UpgradeModal from '../components/UpgradeModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [tenantInfo, setTenantInfo] = useState({ plan: 'starter', clientLimit: 10 });
    
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        nif: '',
        basePrice: 0,
        address: '',
        serviceType: 'tienda',
        frequency: 'mensual'
    });
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, clientId: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, message: '', upgradeTo: '' });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchClients();
        setTenantInfo({ plan: user.plan || 'starter', clientLimit: user.plan === 'starter' ? 10 : 100 });
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar clientes');
            setLoading(false);
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                const res = await axios.patch(`https://glassy.es/api/clients/${editingClient._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients(clients.map(c => c._id === editingClient._id ? res.data.client || res.data : c));
            } else {
                const res = await axios.post('https://glassy.es/api/clients', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients([...clients, res.data.client]);
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

    const handleDeleteClient = (id) => {
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
            email: c.email,
            phone: c.phone || '',
            nif: c.nif,
            basePrice: c.basePrice,
            address: c.address,
            serviceType: c.serviceType,
            frequency: c.frequency
        });
        setShowAddForm(true);
    };

    const closeModal = () => {
        setShowAddForm(false);
        setEditingClient(null);
        setFormData({ companyName: '', email: '', phone: '', nif: '', basePrice: 0, address: '', serviceType: 'tienda', frequency: 'mensual' });
    };

    const [selectedClient, setSelectedClient] = useState(null);
    const [clientAssignments, setClientAssignments] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const filteredClients = clients.filter(c => 
        (c?.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (c?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const fetchClientDetails = async (client) => {
        setSelectedClient(client);
        setLoadingDetails(true);
        try {
            const res = await axios.get('https://glassy.es/api/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientAssignments(res.data.filter(a => a.clientId?._id === client._id));
            setLoadingDetails(false);
        } catch (err) {
            console.error(err);
            setLoadingDetails(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Clientes</h1>
                        <p className="text-sm text-[#697386] mt-1">Gestión de cartera y seguimientos de servicio.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 text-[#aab7c4]" size={16} />
                            <input 
                                type="text" placeholder="Filtrar por nombre..." 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-[#e3e8ee] rounded-lg outline-none focus:border-[#635bff] shadow-sm text-sm transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="bg-[#635bff] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#4f46e5] transition-all shadow-lg shadow-indigo-100"
                        >
                            <Plus size={18} /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-[#e3e8ee] animate-pulse"></div>)
                    ) : filteredClients.length === 0 ? (
                        <div className="col-span-full py-32 text-center flex flex-col items-center opacity-30">
                            <Users size={48} className="mb-4" />
                            <p className="text-sm font-bold">No se encontraron clientes.</p>
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <motion.div
                                key={client._id}
                                layout
                                className="stripe-card p-8 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#635bff] font-bold text-2xl border border-indigo-100">
                                            {client.companyName.charAt(0)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(client)} className="p-2 text-[#697386] hover:text-[#635bff] hover:bg-[#f6f9fc] rounded-lg transition-all"><Edit2 size={16}/></button>
                                            <button onClick={() => handleDeleteClient(client._id)} className="p-2 text-[#697386] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0a2540] mb-2 truncate">{client.companyName}</h3>
                                    <div className="space-y-2 mb-8">
                                        <div className="flex items-center gap-2 text-xs text-[#697386] font-medium">
                                            <MapPin size={14} className="text-[#635bff]" />
                                            <span className="truncate">{client.address}</span>
                                        </div>
                                        {client.phone && (
                                            <div className="flex items-center gap-2 text-xs text-[#697386] font-medium">
                                                <Phone size={14} className="text-[#635bff]" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="pt-6 border-t border-[#f6f9fc] space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#697386]">Igualada ({client.frequency})</span>
                                            <span className="text-[#0a2540] font-bold">{client.basePrice}€</span>
                                        </div>
                                        {client.monthlyProgress && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] text-[#697386] font-bold uppercase tracking-wider">
                                                    <span>Progreso Mensual</span>
                                                    <span>{client.monthlyProgress.completed} / {client.monthlyProgress.expected}</span>
                                                </div>
                                                <div className="w-full bg-[#f6f9fc] rounded-full h-2 overflow-hidden border border-[#e3e8ee]">
                                                    <div 
                                                        className="bg-[#635bff] h-full transition-all duration-1000" 
                                                        style={{ width: `${Math.min((client.monthlyProgress.completed / client.monthlyProgress.expected) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-8 pt-2">
                                    <button 
                                        onClick={() => window.location.href='/app/assignments'}
                                        className="flex-[2] py-3 rounded-xl bg-[#0a2540] text-white text-xs font-bold hover:bg-[#635bff] transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        Asignar Ruta
                                    </button>
                                    <button 
                                        onClick={() => fetchClientDetails(client)}
                                        className="flex-1 py-3 rounded-xl bg-white border border-[#e3e8ee] text-[#0a2540] text-xs font-bold hover:bg-[#f6f9fc] transition-all"
                                    >
                                        Detalles
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showAddForm && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
                            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#fcfdfe]">
                                <h2 className="text-xl font-bold text-[#0a2540]">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-[#f6f9fc] rounded-xl transition-all text-[#697386] border border-transparent hover:border-[#e3e8ee]"><X size={20}/></button>
                            </div>
                            <div className="overflow-y-auto p-8 space-y-6">
                                <form onSubmit={handleAction} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Nombre Comercial / Empresa</label>
                                        <input 
                                            type="text" required value={formData.companyName}
                                            className="w-full px-4 py-3.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] text-[#0a2540] font-bold text-lg"
                                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">CIF / NIF</label>
                                            <input type="text" value={formData.nif} className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]" onChange={(e) => setFormData({...formData, nif: e.target.value})} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Teléfono</label>
                                            <input type="text" value={formData.phone} className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Dirección Completa (Google Maps)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3.5 text-[#aab7c4]" size={18} />
                                            <input 
                                                type="text" required value={formData.address}
                                                className="w-full pl-11 pr-4 py-3.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Tipo de Local</label>
                                            <select value={formData.serviceType} className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540] appearance-none" onChange={(e) => setFormData({...formData, serviceType: e.target.value})} >
                                                <option value="tienda">Local Comercial</option>
                                                <option value="oficina">Oficina</option>
                                                <option value="restaurante">Restaurante</option>
                                                <option value="hogar">Residencial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Frecuencia de Servicio</label>
                                            <select value={formData.frequency} className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540] appearance-none" onChange={(e) => setFormData({...formData, frequency: e.target.value})} >
                                                <option value="mensual">Mensual</option>
                                                <option value="quincenal">Quincenal</option>
                                                <option value="semanal">Semanal</option>
                                                <option value="puntual">Puntual</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1 text-center block">Tarifa Mensual / Igualada (€)</label>
                                        <input 
                                            type="number" required value={formData.basePrice}
                                            className="w-full px-4 py-6 bg-[#0a2540] text-white rounded-2xl outline-none font-bold text-4xl text-center shadow-xl shadow-indigo-100"
                                            onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                                        />
                                    </div>
                                    <button className="w-full bg-[#635bff] text-white py-5 rounded-2xl font-bold text-sm hover:bg-[#4f46e5] shadow-xl shadow-indigo-100 transition-all active:scale-95">
                                        {editingClient ? 'Actualizar Cliente' : 'Registrar Cliente'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                   </div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                 {selectedClient && (
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-[#0a2540]/60 backdrop-blur-sm">
                         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-screen md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-[#e3e8ee]">
                             <div className="p-8 border-b border-[#e3e8ee] flex items-center justify-between bg-[#fcfdfe]">
                                 <div className="flex items-center gap-5">
                                     <div className="w-16 h-16 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center font-bold text-2xl border border-indigo-100">
                                         {selectedClient.companyName.charAt(0)}
                                     </div>
                                     <div>
                                         <h2 className="text-2xl font-bold text-[#0a2540]">{selectedClient.companyName}</h2>
                                         <p className="text-sm text-[#697386] font-medium flex items-center gap-2"><MapPin size={14} /> {selectedClient.address}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => setSelectedClient(null)} className="p-2.5 text-[#697386] hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100"><X size={24}/></button>
                             </div>

                             <div className="p-8 overflow-y-auto flex-1 space-y-4 bg-[#f6f9fc]/50">
                                 {loadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <RefreshCcw className="animate-spin text-[#635bff]" size={32} />
                                        <p className="text-sm font-bold text-[#697386]">Cargando historial...</p>
                                    </div>
                                 ) : clientAssignments.length > 0 ? (
                                    clientAssignments.flatMap(as => {
                                        if (as.visitLogs && as.visitLogs.length > 0) {
                                            return as.visitLogs.map((log, lIdx) => ({
                                                ...as,
                                                displayDate: log.date,
                                                displayWorker: log.workerName || 'Staff',
                                                isVisit: true,
                                                logId: `${as._id}-${lIdx}`
                                            }));
                                        }
                                        return [{
                                            ...as,
                                            displayDate: as.date,
                                            displayWorker: as.workerId?.fullName || 'S/A',
                                            isVisit: false,
                                            logId: as._id
                                        }];
                                    })
                                    .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
                                    .map((entry) => (
                                        <div key={entry.logId} className="bg-white p-5 rounded-2xl border border-[#e3e8ee] flex items-center justify-between shadow-sm hover:shadow-lg hover:border-[#635bff] transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${entry.status === 'completado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0a2540] text-base capitalize">
                                                        {new Date(entry.displayDate).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-bold text-[#697386] uppercase tracking-widest bg-[#f6f9fc] px-2 py-0.5 rounded-full border border-[#e3e8ee]">{entry.displayWorker}</span>
                                                        {entry.isVisit && <span className="text-[10px] bg-indigo-50 text-[#635bff] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-indigo-100">VISITA EXTRA</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#0a2540] text-lg">{entry.price}€</p>
                                                <button 
                                                    onClick={async (e) => {
                                                        const btn = e.target;
                                                        const prevText = btn.innerText;
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
                                                            btn.innerText = prevText;
                                                        }
                                                    }}
                                                    className="text-[10px] text-[#635bff] font-bold hover:text-[#0a2540] transition-colors uppercase tracking-widest flex items-center gap-1.5 justify-end"
                                                >
                                                    <FileText size={14} /> Factura PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                 ) : (
                                    <div className="text-center py-20 opacity-30 flex flex-col items-center">
                                        <History size={48} className="mb-4" />
                                        <p className="text-sm font-bold uppercase">Sin registros de servicio.</p>
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
                message="Esta acción no se puede deshacer. Se archivará el historial y las rutas pendientes."
                confirmText="Eliminar permanentemente"
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
