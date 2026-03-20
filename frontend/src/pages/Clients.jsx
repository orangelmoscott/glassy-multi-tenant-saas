import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, 
  Trash2, Edit2, FileText, TrendingUp, AlertCircle, CheckCircle2, X, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [tenantInfo, setTenantInfo] = useState({ plan: 'starter', clientLimit: 10 });
    
    // State para Edición
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        nif: '',
        basePrice: 0,
        address: '',
        serviceType: 'tienda',
        frequency: 'mensual'
    });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchClients();
        setTenantInfo({ plan: user.plan || 'starter', clientLimit: user.plan === 'starter' ? 10 : 100 });
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get('https://glassy-backend.onrender.com/clients', {
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
                const res = await axios.patch(`https://glassy-backend.onrender.com/clients/${editingClient._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients(clients.map(c => c._id === editingClient._id ? res.data.client || res.data : c));
                alert('Cliente actualizado con éxito');
            } else {
                const res = await axios.post('https://glassy-backend.onrender.com/clients', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients([...clients, res.data.client]);
                alert('Cliente registrado con éxito');
            }
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Error en la operación');
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('¿ELIMINAR CLIENTE? Se perderá todo el historial de servicios.')) return;
        try {
            await axios.delete(`https://glassy-backend.onrender.com/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(clients.filter(c => c._id !== id));
        } catch (err) {
            alert('Error al eliminar cliente');
        }
    };

    const startEdit = (c) => {
        setEditingClient(c);
        setFormData({
            companyName: c.companyName,
            email: c.email,
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
        setFormData({ companyName: '', email: '', nif: '', basePrice: 0, address: '', serviceType: 'tienda', frequency: 'mensual' });
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
            const res = await axios.get('https://glassy-backend.onrender.com/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientAssignments(res.data.filter(a => a.clientId?._id === client._id));
            setLoadingDetails(false);
        } catch (err) {
            console.error(err);
            setLoadingDetails(false);
        }
    };

    const usagePercentage = (clients.length / tenantInfo.clientLimit) * 100;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Users className="text-blue-600" size={32} /> Gestión de Cartera
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Administra tu cartera empresarial con Glassy SaaS.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative group flex-1">
                            <Search className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text" placeholder="Buscar cliente..." 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm w-full md:w-64 transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-200 active:scale-95 whitespace-nowrap"
                        >
                            <UserPlus size={20} /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-56 bg-white rounded-[40px] border border-slate-50 animate-pulse shadow-sm"></div>)
                    ) : filteredClients.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-30 italic">No se encontraron clientes que coincidan con la búsqueda.</div>
                    ) : (
                        filteredClients.map((client) => (
                            <motion.div
                                key={client._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        {client.companyName.charAt(0)}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(client)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDeleteClient(client._id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">{client.companyName}</h3>
                                <p className="text-sm text-slate-400 font-bold mb-6 flex items-center gap-2">
                                    <MapPin size={14} className="text-blue-400" /> {client.address}
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                        <span>Plan Mensual:</span>
                                        <span className="text-slate-900 font-black">{client.basePrice}€</span>
                                    </div>
                                    <button 
                                        onClick={() => fetchClientDetails(client)}
                                        className="w-full py-3.5 rounded-2xl bg-slate-50 font-black text-xs text-slate-600 uppercase tracking-widest border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                    >
                                        Ver Historial Global
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Cliente (Cargar / Editar) */}
            <AnimatePresence>
                {showAddForm && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-3xl overflow-y-auto max-h-[90vh]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-800">{editingClient ? 'Modificar Cliente' : 'Nuevo Registro'}</h2>
                                <button onClick={closeModal} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleAction} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre de la Empresa</label>
                                    <input 
                                        type="text" required value={formData.companyName}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="NIF" value={formData.nif} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, nif: e.target.value})} />
                                    <input type="email" placeholder="Email de Facturación" value={formData.email} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dirección Física (Exacta para GPS)</label>
                                    <input type="text" required value={formData.address} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.serviceType} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, serviceType: e.target.value})} >
                                        <option value="tienda">Tienda / Local</option>
                                        <option value="oficina">Oficina Corporate</option>
                                        <option value="restaurante">Restaurante / Hostelería</option>
                                        <option value="hogar">Residencia Privada</option>
                                    </select>
                                    <select value={formData.frequency} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" onChange={(e) => setFormData({...formData, frequency: e.target.value})} >
                                        <option value="mensual">Mensual</option>
                                        <option value="quincenal">Quincenal</option>
                                        <option value="semanal">Semanal</option>
                                        <option value="puntual">Puntual</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio de Igualada / Base (€)</label>
                                    <input type="number" required value={formData.basePrice} className="w-full px-5 py-4 bg-slate-900 text-white border border-slate-100 rounded-2xl outline-none font-black text-xl" onChange={(e) => setFormData({...formData, basePrice: e.target.value})} />
                                </div>
                                <button className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black mt-6 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all uppercase tracking-widest text-sm">
                                    {editingClient ? 'Confirmar Cambios' : 'Registrar Cliente'}
                                </button>
                            </form>
                        </motion.div>
                   </div>
                )}
            </AnimatePresence>

            {/* Modal de Historial */}
            <AnimatePresence>
                 {selectedClient && (
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-3xl">
                             <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                                 <div className="flex items-center gap-5">
                                     <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 font-black text-2xl">
                                         {selectedClient.companyName.charAt(0)}
                                     </div>
                                     <div>
                                         <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedClient.companyName}</h2>
                                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <MapPin size={12} /> {selectedClient.address}
                                         </p>
                                     </div>
                                 </div>
                                 <button onClick={() => setSelectedClient(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
                             </div>

                             <div className="p-10 overflow-y-auto flex-1 space-y-6 bg-slate-50/30">
                                 {loadingDetails ? (
                                    <div className="text-center py-20 animate-pulse font-bold text-slate-400 uppercase tracking-widest">Consultando registros...</div>
                                 ) : clientAssignments.length > 0 ? (
                                    clientAssignments.map(as => (
                                        <div key={as._id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="font-black text-slate-800">{new Date(as.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${as.status === 'completado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {as.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">{as.workerId?.fullName || 'S/A'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 text-lg">{as.price}€</p>
                                                <button 
                                                    onClick={() => window.open(`https://glassy-backend.onrender.com/assignments/${as._id}/invoice`, '_blank')}
                                                    className="text-[10px] text-blue-600 font-black hover:underline uppercase tracking-widest"
                                                >
                                                    Descargar PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                 ) : (
                                    <div className="text-center py-20 opacity-30 italic">Sin servicios registrados.</div>
                                 )}
                             </div>
                         </motion.div>
                     </div>
                 )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Clients;
