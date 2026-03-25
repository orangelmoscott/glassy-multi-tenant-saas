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
    const [extraServiceData, setExtraServiceData] = useState({ description: '', price: '' });
    const [filterWorkerId, setFilterWorkerId] = useState('');
    const [selectedAssignmentForLogs, setSelectedAssignmentForLogs] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [routeData, setRouteData] = useState({
        workerId: '',
        date: '',
        clientIds: [],
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

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const res = await axios.put(`https://glassy-backend.onrender.com/assignments/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments(assignments.map(a => a._id === editingId ? res.data : a));
                alert('Asignación actualizada');
            } else {
                const res = await axios.post('https://glassy-backend.onrender.com/assignments', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments([res.data, ...assignments]);
            }
            setShowAddModal(false);
            setEditingId(null);
            setFormData({
                clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: []
            });
        } catch (err) {
            alert('Error al procesar servicio');
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

    const handleReplicateMonth = async () => {
        if (!window.confirm(`¿Replicar todas las rutas de ${new Date(2024, filterMonth - 2).toLocaleString('es-ES', {month: 'long'})} a este mes (${new Date(2024, filterMonth - 1).toLocaleString('es-ES', {month: 'long'})})?`)) return;
        
        try {
            setLoading(true);
            const prevMonth = filterMonth === 1 ? 12 : filterMonth - 1;
            const prevYear = filterMonth === 1 ? filterYear - 1 : filterYear;
            
            // 1. Obtener asignaciones del mes anterior
            const res = await axios.get('https://glassy-backend.onrender.com/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const prevAssignments = res.data.filter(as => {
                const d = new Date(as.date);
                return (d.getMonth() + 1) === prevMonth && d.getFullYear() === prevYear && !as.isDeleted;
            });

            if (prevAssignments.length === 0) {
                alert('No hay rutas en el mes anterior para replicar.');
                return;
            }

            // 2. Crear copias para el mes actual
            const promises = prevAssignments.map(as => {
                const newDate = new Date(filterYear, filterMonth - 1, new Date(as.date).getDate());
                return axios.post('https://glassy-backend.onrender.com/assignments', {
                    clientId: as.clientId?._id || as.clientId,
                    workerId: as.workerId?._id || as.workerId,
                    date: newDate,
                    notes: as.notes,
                    price: as.price
                }, { headers: { Authorization: `Bearer ${token}` } });
            });

            await Promise.all(promises);
            fetchAssignments();
            alert(`Se han replicado ${prevAssignments.length} rutas con éxito.`);
        } catch (err) {
            alert('Error al replicar el mes.');
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
                        <User size={20} /> Asignar Ruta Completa
                    </button>
                    <button 
                        onClick={handleReplicateMonth}
                        className="bg-white text-slate-600 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                        title="Copia todas las rutas del mes anterior al mes actual"
                    >
                        <RefreshCcw size={20} /> Replicar Mes Anterior
                    </button>
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: []
                            });
                            setShowAddModal(true);
                        }} 
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
                         <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">{assignments.filter(a => !a.isDeleted).length}</div>
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Activas</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                        <select 
                            className="bg-transparent outline-none w-full font-bold text-slate-600 text-sm p-2"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                        >
                            {Array.from({length: 12}, (_, i) => (
                                <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('es-ES', {month: 'long'})}</option>
                            ))}
                        </select>
                        <select 
                            className="bg-transparent outline-none font-bold text-slate-600 text-sm p-2"
                            value={filterYear}
                            onChange={(e) => setFilterYear(parseInt(e.target.value))}
                        >
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <User className="text-slate-400 ml-2" size={18} />
                        <select 
                            className="bg-transparent outline-none w-full font-bold text-slate-600 text-sm"
                            value={filterWorkerId}
                            onChange={(e) => setFilterWorkerId(e.target.value)}
                        >
                            <option value="">Filtrar todos los cristaleros (Toda la Empresa)</option>
                            {workers.map(w => <option key={w._id} value={w._id}>Trabajos de: {w.fullName}</option>)}
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
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operario & Progreso</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total (€)</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {assignments
                                    .filter(as => !as.isDeleted)
                                    .filter(as => !filterWorkerId || (as.workerId?._id === filterWorkerId || as.workerId === filterWorkerId))
                                    .filter(as => {
                                        const d = new Date(as.date);
                                        return (d.getMonth() + 1) === filterMonth && d.getFullYear() === filterYear;
                                    })
                                    .map((as) => (
                                    <tr key={as._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors relative">
                                                    <MapPin size={20} />
                                                    {as.notes && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" title="Tiene notas"></div>}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{as.clientId?.companyName || 'Cliente Desc.'}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{as.clientId?.address || 'Sin dirección'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                    <User size={14} className="text-blue-500" /> {as.workerId?.fullName || 'Sin asignar'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500 rounded-full" 
                                                            style={{ width: `${Math.min(((as.visitsDone || 0) / (as.expectedVisits || 1)) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedAssignmentForLogs(as)}
                                                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                                                    >
                                                        {as.visitsDone || 0}/{as.expectedVisits || 1} <Info size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                         <td className="px-8 py-6">
                                             <div className="flex flex-col">
                                                 <span className="text-sm font-bold text-slate-800">{new Date(as.date).toLocaleDateString()}</span>
                                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                     <Clock size={10} /> {as.status === 'completado' ? 'Finalizado' : 'En curso'}
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
                                                {as.status === 'completado' && (
                                                    <>
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
                                                    </>
                                                )}
                                                
                                                <button 
                                                    onClick={() => {
                                                        setEditingId(as._id);
                                                        setFormData({
                                                            clientId: as.clientId?._id,
                                                            workerId: as.workerId?._id,
                                                            date: as.date.split('T')[0],
                                                            price: as.price,
                                                            notes: as.notes || '',
                                                            extraServices: as.extraServices || []
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                    className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-600 hover:text-white rounded-xl transition-all"
                                                    title="Editar Asignación"
                                                >
                                                    <PenTool size={18} />
                                                </button>

                                                <button 
                                                    onClick={async () => {
                                                        if (!window.confirm('¿Seguro que deseas eliminar esta asignación?')) return;
                                                        try {
                                                            await axios.delete(`https://glassy-backend.onrender.com/assignments/${as._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                            setAssignments(assignments.filter(a => a._id !== as._id));
                                                        } catch (err) {
                                                            alert('Error al eliminar');
                                                        }
                                                    }}
                                                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
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
                             <h2 className="text-2xl font-extrabold text-slate-800 mb-8">{editingId ? 'Editar Asignación' : 'Programar Nueva Ruta'}</h2>
                             <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                                        <select 
                                            required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                            value={formData.clientId}
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
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Operario Asignado</label>
                                        <select 
                                            required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                            value={formData.workerId}
                                            onChange={(e) => setFormData({...formData, workerId: e.target.value})}
                                        >
                                            <option value="">Elige un cristalero...</option>
                                            {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                                        </select>
                                     </div>
                                </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Precio Automático (€)</label>
                                    <div className="w-full px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-600">
                                        {formData.price || '0.00'}€
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Fecha Programada</label>
                                     <input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
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
                                    <button 
                                     type="submit" 
                                     className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-extrabold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
                                 >
                                     {editingId ? 'Guardar Cambios' : 'Asignar Servicio'}
                                 </button>
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

                {/* Visit Logs Modal */}
                <AnimatePresence>
                    {selectedAssignmentForLogs && (
                        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-800">Detalle de Limpiezas</h3>
                                        <p className="text-sm text-slate-400 font-medium">{selectedAssignmentForLogs.clientId?.companyName}</p>
                                    </div>
                                    <button onClick={() => setSelectedAssignmentForLogs(null)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto space-y-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Visitas</p>
                                            <p className="text-2xl font-black text-slate-800">{selectedAssignmentForLogs.visitsDone || 0} de {selectedAssignmentForLogs.expectedVisits || 1}</p>
                                        </div>
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Estado General</p>
                                            <p className="text-2xl font-black text-blue-700 capitalize">{selectedAssignmentForLogs.status}</p>
                                        </div>
                                    </div>

                                    {(!selectedAssignmentForLogs.visitLogs || selectedAssignmentForLogs.visitLogs.length === 0) ? (
                                        <div className="text-center py-10">
                                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                 <AlertCircle size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sin visitas registradas todavía</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro Cronológico de Validaciones</p>
                                            <div className="grid gap-4">
                                                {selectedAssignmentForLogs.visitLogs.map((log, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[30px] flex items-center justify-between shadow-sm group hover:border-blue-200 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-extrabold text-slate-800">{new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest mt-0.5">
                                                                    <Clock size={10}/> {new Date(log.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {log.signature ? (
                                                                <div className="relative group/sig">
                                                                    <img src={log.signature} alt="Firma cliente" className="h-12 w-24 object-contain bg-slate-50 rounded-xl border border-slate-100 shadow-sm" />
                                                                    <div className="absolute inset-0 bg-blue-600/90 rounded-xl opacity-0 group-hover/sig:opacity-100 transition-all flex items-center justify-center">
                                                                        <CheckCircle size={16} className="text-white" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Sin Firma</span>
                                                            )}
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Validación de Limpieza</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 bg-slate-50 border-t border-slate-100">
                                    <button onClick={() => setSelectedAssignmentForLogs(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">Cerrar Registro</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default Assignments;
