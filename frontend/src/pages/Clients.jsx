import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, 
  Trash2, Edit2, FileText, TrendingUp, AlertCircle, CheckCircle2, X, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import PricingModal from '../components/PricingModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [tenantInfo, setTenantInfo] = useState({ plan: 'starter', clientLimit: 10 });
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        nif: '',
        email: '',
        phone: '',
        address: '',
        serviceType: 'tienda', // Agregado: Requerido por el esquema backend
        frequency: 'mensual',
        basePrice: 0
    });

    // Sesión
    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchClients();
        // En real, aquí pedirías al backend el estado del tenant
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

    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://glassy-backend.onrender.com/clients', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // El backend envía { message, client }
            setClients([...clients, res.data.client]);
            setShowAddForm(false);
            setFormData({ 
                companyName: '', 
                nif: '', 
                email: '', 
                phone: '', 
                address: '', 
                serviceType: 'tienda', 
                frequency: 'mensual', 
                basePrice: 0 
            });
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.upgradeSuggested) {
                setIsPricingModalOpen(true);
            } else {
                alert(err.response?.data?.message || 'Error al guardar cliente');
            }
        }
    };

    const [selectedClient, setSelectedClient] = useState(null);
    const [clientAssignments, setClientAssignments] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const filteredClients = clients.filter(c => 
        (c?.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (c?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const handleDeleteClient = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este cliente? Se perderá su historial.')) return;
        try {
            await axios.delete(`https://glassy-backend.onrender.com/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(clients.filter(c => c._id !== id));
        } catch (err) {
            alert('Error al eliminar cliente');
        }
    };

    const fetchClientDetails = async (client) => {
        setSelectedClient(client);
        setLoadingDetails(true);
        try {
            const res = await axios.get('https://glassy-backend.onrender.com/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filtrar solo las de este cliente
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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Users className="text-blue-600" size={32} /> Gestión de Clientes
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Administra tu cartera empresarial con Glassy.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text" placeholder="Buscar cliente..." 
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm w-full md:w-64 transition-all"
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Plan Usage Banner */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Uso de Cartera ({tenantInfo.plan.toUpperCase()})</h3>
                            <p className="text-sm text-slate-500">Has registrado <span className="font-bold text-blue-600">{clients.length}</span> de <span className="font-bold">{tenantInfo.clientLimit}</span> clientes permitidos.</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 max-w-sm">
                        <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-slate-400">
                             <span>Capacidad</span>
                             <span className={usagePercentage > 80 ? 'text-amber-500' : 'text-slate-500'}>{Math.round(usagePercentage)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                className={`h-full rounded-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsPricingModalOpen(true)}
                        className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap flex items-center gap-2"
                    >
                        <AlertCircle size={16} /> Ver Planes
                    </button>
                </div>

                {/* Clients Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-30">
                        {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredClients.map((client) => (
                                <motion.div
                                    key={client._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group pointer-events-auto"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Users size={24} />
                                        </div>
                                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClient(client._id); }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                             >
                                                <Trash2 size={16}/>
                                             </button>
                                         </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{client.companyName}</h3>
                                    <p className="text-sm text-slate-400 mb-4">{client.email || 'Sin email'}</p>
                                    
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 mb-1">Precio Fijo</span>
                                            <span className="text-slate-900">{client.basePrice}€ / svc</span>
                                        </div>
                                         <div className="flex flex-col items-end">
                                            <span className="text-slate-400 mb-1">Frecuencia</span>
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{client.frequency}</span>
                                        </div>
                                    </div>
                                                                        <button 
                                         onClick={() => fetchClientDetails(client)}
                                         className="w-full mt-6 py-2.5 rounded-xl border border-slate-100 font-bold text-sm text-slate-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all flex items-center justify-center gap-2"
                                     >
                                         <FileText size={16} /> Ver Historial
                                     </button>
                                 </motion.div>
                             ))}
                         </AnimatePresence>
                     </div>
                 )}
             </div>

             {/* Modal de Detalle de Cliente / Historial */}
             <AnimatePresence>
                 {selectedClient && (
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                         <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-3xl">
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

                             <div className="p-10 overflow-y-auto flex-1 space-y-8 bg-slate-50/30">
                                 <div>
                                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Registro de Limpiezas</h3>
                                     <div className="space-y-3">
                                         {loadingDetails ? (
                                             <div className="animate-pulse space-y-3">
                                                 <div className="h-16 bg-slate-100 rounded-2xl"></div>
                                                 <div className="h-16 bg-slate-100 rounded-2xl"></div>
                                             </div>
                                         ) : clientAssignments.length > 0 ? (
                                             clientAssignments.map((as) => (
                                                 <div key={as._id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                     <div className="flex items-center gap-4">
                                                         <div className={`w-2 h-2 rounded-full ${as.status === 'completado' ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                                         <div>
                                                            <p className="font-bold text-slate-800">{new Date(as.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{as.status}</p>
                                                         </div>
                                                     </div>
                                                     <div className="text-right">
                                                         <p className="font-black text-slate-900">{as.price}€</p>
                                                         {as.status === 'completado' && <p className="text-[10px] text-green-600 font-bold uppercase">Validado con firma</p>}
                                                     </div>
                                                 </div>
                                             ))
                                         ) : (
                                            <div className="text-center py-10 opacity-30 italic font-medium">No hay servicios registrados aún.</div>
                                         )}
                                     </div>
                                 </div>

                                 <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between">
                                     <div>
                                         <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Precio Fijo Pactado</p>
                                         <p className="text-xl font-black">{selectedClient.basePrice}€ / mensual</p>
                                     </div>
                                     <button className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl text-xs font-bold transition-all">Modificar Acuerdo</button>
                                 </div>
                             </div>
                         </motion.div>
                     </div>
                 )}
             </AnimatePresence>

            {/* Modal de Registro (Simplified) */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-xl p-10 shadow-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-slate-800">Cargar Nuevo Cliente</h2>
                            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddClient} className="space-y-4">
                            <input 
                                type="text" placeholder="Nombre Comercial" required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="NIF" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, nif: e.target.value})} />
                                <input type="text" placeholder="Teléfono" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <input 
                                type="text" placeholder="Dirección Exacta (Para el mapa del operario)" required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                            <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, serviceType: e.target.value})} >
                                    <option value="tienda">Tienda / Local</option>
                                    <option value="oficina">Oficina</option>
                                    <option value="restaurante">Restaurante</option>
                                    <option value="hogar">Ubicación Privada / Hogar</option>
                                </select>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, frequency: e.target.value})} >
                                    <option value="mensual">Limpieza Mensual</option>
                                    <option value="quincenal">Limpieza Quincenal</option>
                                    <option value="semanal">Limpieza Semanal</option>
                                    <option value="puntual">Servicio Puntual</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio Fijo del Servicio (€)</label>
                                <input type="number" placeholder="Precio Base (€)" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, basePrice: e.target.value})} />
                            </div>
                            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4 hover:bg-slate-800 shadow-xl transition-all active:scale-95">Guardar Cliente Estratégico</button>
                        </form>
                    </motion.div>
                </div>
            )}

            <PricingModal 
                isOpen={isPricingModalOpen} 
                onClose={() => setIsPricingModalOpen(false)} 
                currentPlan={tenantInfo.plan} 
            />
        </DashboardLayout>
    );
};

export default Clients;
