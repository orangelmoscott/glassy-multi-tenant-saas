import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, CheckCircle2, Clock, MapPin, 
  MoreHorizontal, Plus, Search, User, FileText, 
  Trash2, Edit2, Play, Download, ChevronRight, X, Phone, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [clients, setClients] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        workerId: '', // Cambiado de workerName a workerId real
        date: '',
        price: 0,
        notes: '',
        extraServices: []
    });
    const [extraServiceData, setExtraServiceData] = useState({ description: '', price: '' });
    const [filterWorkerId, setFilterWorkerId] = useState('');
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [routeData, setRouteData] = useState({
        workerId: '',
        date: '',
        clientIds: [], // Multi select
        notes: ''
    });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignRes, clientRes, workerRes] = await Promise.all([
                axios.get('https://glassy-backend.onrender.com/assignments', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('https://glassy-backend.onrender.com/clients', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('https://glassy-backend.onrender.com/users/workers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setAssignments(assignRes.data);
            setClients(clientRes.data);
            setWorkers(workerRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://glassy-backend.onrender.com/assignments', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments([res.data, ...assignments]);
            setShowAddModal(false);
            setFormData({
                clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: []
            });
        } catch (err) {
            alert('Error al crear servicio');
        }
    };

    const handleCreateRoute = async (e) => {
        e.preventDefault();
        if (routeData.clientIds.length === 0) return alert('Selecciona al menos un cliente');
        
        try {
            setLoading(true);
            const promises = routeData.clientIds.map(clientId => {
                const client = clients.find(c => c._id === clientId);
                return axios.post('https://glassy-backend.onrender.com/assignments', {
                    clientId,
                    workerId: routeData.workerId,
                    date: routeData.date,
                    notes: routeData.notes,
                    price: client ? client.basePrice : 0
                }, { headers: { Authorization: `Bearer ${token}` } });
            });
            
            const results = await Promise.all(promises);
            const newAssignments = results.map(r => r.data);
            
            setAssignments([...newAssignments, ...assignments]);
            setShowRouteModal(false);
            setRouteData({ workerId: '', date: '', clientIds: [], notes: '' });
            alert('Ruta completa asignada exitosamente');
        } catch (err) {
            alert('Error al asignar ruta completa');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const response = await axios.get(`https://glassy-backend.onrender.com/assignments/${id}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Factura_Glassy_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al generar PDF. Asegúrate de tener datos de empresa configurados.');
        }
    };

    const handleEmailInvoice = async (id) => {
        if (!window.confirm('¿Enviar factura ahora al email del cliente?')) return;
        try {
            const res = await axios.post(`https://glassy-backend.onrender.com/assignments/${id}/send-invoice`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || 'Error al enviar email');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-600 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-amber-100 text-amber-600 border-amber-200';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Rutas y Servicios</h1>
                    <p className="text-slate-500 font-medium">Gestión de cronogramas y asignación por cristaleros.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowRouteModal(true)} 
                        className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-blue-50"
                    >
                        <User size={20} /> Asignar Ruta por Cristalero
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)} 
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-200 active:scale-95"
                    >
                        <Plus size={20} /> Asignar Servicio
                    </button>
                </div>
            </div>

            <div className="space-y-8 mb-10">
                {/* Filters & Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">{assignments.length}</div>
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Rutas</div>
                    </div>
                    
                    <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <User className="text-slate-400 ml-2" />
                        <select 
                            className="bg-transparent outline-none w-full font-bold text-slate-600 text-sm"
                            value={filterWorkerId}
                            onChange={(e) => setFilterWorkerId(e.target.value)}
                        >
                            <option value="">Filtrar todas las rutas (Toda la Empresa)</option>
                            {workers.map(w => <option key={w._id} value={w._id}>Ver solo ruta de: {w.fullName}</option>)}
                        </select>
                    </div>
                </div>

                {/* Assignment List - Professional Table Style */}
                <div className="bg-white rounded-[35px] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cliente / Ubicación</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Asignado a</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fecha Programada</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Precio</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {assignments
                                    .filter(as => !filterWorkerId || (as.workerId?._id === filterWorkerId || as.workerId === filterWorkerId))
                                    .map((as) => (
                                    <tr key={as._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{as.clientId?.companyName || 'Cliente Desc.'}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{as.clientId?.address || 'Sin dirección'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <User size={16} className="text-blue-500" /> {as.workerId?.fullName || 'Sin asignar'}
                                            </div>
                                        </td>
                                         <td className="px-8 py-6">
                                             <div className="flex flex-col">
                                                 <span className="text-sm font-bold text-slate-800">{new Date(as.date).toLocaleDateString()}</span>
                                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                     <Clock size={10} /> Pendiente
                                                 </span>
                                             </div>
                                         </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusColor(as.status)}`}>
                                                {as.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-extrabold text-slate-800">
                                            <div className="flex flex-col gap-1">
                                                <span>{(as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)).toFixed(2)}€</span>
                                                {as.extraServices && as.extraServices.length > 0 && (
                                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">+ Extras</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDownloadPDF(as._id)}
                                                    className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all group/btn"
                                                    title="Descargar Factura PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEmailInvoice(as._id)}
                                                    className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all group/btn"
                                                    title="Enviar por Email"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {assignments.length === 0 && !loading && (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="font-bold text-slate-800">No hay rutas hoy</h3>
                                <p className="text-slate-500 text-sm">Empieza por crear una nueva asignación para tu equipo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Nueva Ruta */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-3xl">
                             <h2 className="text-2xl font-extrabold text-slate-800 mb-8">Programar Nueva Ruta</h2>
                             <form onSubmit={handleCreate} className="space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cliente Receptor</label>
                                    <select 
                                        required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                        onChange={(e) => {
                                            const clientId = e.target.value;
                                            const client = clients.find(c => c._id === clientId);
                                            setFormData({
                                                ...formData, 
                                                clientId, 
                                                price: client ? client.basePrice : 0 
                                            });
                                        }}
                                    >
                                        <option value="">Selecciona un cliente...</option>
                                        {clients.map(c => <option key={c._id} value={c._id}>{c.companyName} ({c.basePrice}€)</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Operario Asignado</label>
                                        <select 
                                            required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                            onChange={(e) => setFormData({...formData, workerId: e.target.value})}
                                        >
                                            <option value="">Elige un cristalero...</option>
                                            {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                                        </select>
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Precio Automático (€)</label>
                                        <div className="w-full px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-600">
                                            {formData.price || '0.00'}€
                                        </div>
                                     </div>
                                </div>
                                 <div className="space-y-2">
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Fecha Programada</label>
                                     <input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                 </div>

                                 <div className="space-y-2">
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Notas / Instrucciones para el Cristalero</label>
                                     <textarea 
                                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-medium text-sm min-h-[100px]"
                                         placeholder="Ej: El cliente prefiere que se empiece por la fachada trasera o tiene un código de acceso..."
                                         value={formData.notes}
                                         onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                     />
                                 </div>

                                 {/* Panel de Servicios Extra */}
                                 <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">¿Añadir Servicio Extra? (Opcional)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Detalle (Ej. Limpieza a fondo)" 
                                            className="flex-[2] px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                                            value={extraServiceData.description}
                                            onChange={(e) => setExtraServiceData({...extraServiceData, description: e.target.value})}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Precio €" 
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                                            value={extraServiceData.price}
                                            onChange={(e) => setExtraServiceData({...extraServiceData, price: e.target.value})}
                                        />
                                        <button 
                                            type="button" 
                                            className="px-4 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors font-bold"
                                            onClick={() => {
                                                if (extraServiceData.description && extraServiceData.price) {
                                                    setFormData({
                                                        ...formData,
                                                        extraServices: [...formData.extraServices, {
                                                            description: extraServiceData.description,
                                                            price: parseFloat(extraServiceData.price)
                                                        }]
                                                    });
                                                    setExtraServiceData({ description: '', price: '' });
                                                }
                                            }}
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    
                                    {/* Lista de Extras Añadidos */}
                                    {formData.extraServices.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {formData.extraServices.map((ex, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm px-4 py-2 bg-blue-50 text-blue-800 rounded-lg">
                                                    <span className="font-bold">{ex.description}</span>
                                                    <span className="font-extrabold">+{ex.price}€</span>
                                                </div>
                                            ))}
                                            <div className="text-right text-sm font-black text-slate-900 mt-2 pr-2">
                                                Total Extra: +{formData.extraServices.reduce((sum, item) => sum + item.price, 0).toFixed(2)}€
                                            </div>
                                        </div>
                                    )}
                                 </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
                                    <button className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-extrabold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">Asignar Ruta</button>
                                </div>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Modal de Asignar Ruta Completa (Bulk) */}
            <AnimatePresence>
                {showRouteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-3xl overflow-y-auto max-h-[90vh]">
                             <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">Crear Ruta Completa para Cristalero</h2>
                                <button onClick={() => setShowRouteModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
                             </div>
                             
                             <form onSubmit={handleCreateRoute} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cristalero de la Ruta</label>
                                        <select 
                                            required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                            value={routeData.workerId}
                                            onChange={(e) => setRouteData({...routeData, workerId: e.target.value})}
                                        >
                                            <option value="">Selecciona quién hará la ruta...</option>
                                            {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                                        </select>
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Fecha de Inicio</label>
                                        <input 
                                            type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" 
                                            value={routeData.date}
                                            onChange={(e) => setRouteData({...routeData, date: e.target.value})} 
                                        />
                                     </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Seleccionar Clientes para la Ruta (Múltiples)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 bg-slate-50/50 rounded-[30px] border border-slate-100">
                                        {clients.map(c => (
                                            <div 
                                                key={c._id} 
                                                onClick={() => {
                                                    const currentIds = routeData.clientIds;
                                                    if (currentIds.includes(c._id)) {
                                                        setRouteData({...routeData, clientIds: currentIds.filter(id => id !== c._id)});
                                                    } else {
                                                        setRouteData({...routeData, clientIds: [...currentIds, c._id]});
                                                    }
                                                }}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${routeData.clientIds.includes(c._id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-700 hover:border-blue-200'}`}
                                            >
                                                <span className="font-bold text-xs truncate max-w-[150px]">{c.companyName}</span>
                                                {routeData.clientIds.includes(c._id) && <CheckCircle2 size={16} />}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium px-2">Seleccionados: <span className="text-blue-600 font-bold">{routeData.clientIds.length}</span> clientes.</p>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nota General para esta Ruta</label>
                                     <textarea 
                                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-medium text-sm min-h-[100px]"
                                         placeholder="Opcional. Estas notas aparecerán en cada cliente seleccionado."
                                         value={routeData.notes}
                                         onChange={(e) => setRouteData({...routeData, notes: e.target.value})}
                                     />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Generando Ruta...' : `Confirmar Ruta (${routeData.clientIds.length} Clientes)`}
                                </button>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default Assignments;
