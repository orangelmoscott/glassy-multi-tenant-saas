import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, CheckCircle, CheckCircle2, Clock, MapPin, 
  MoreHorizontal, Plus, Search, User, FileText, 
  Trash2, Edit2, Play, Download, ChevronRight, X, Phone, Send,
  RefreshCcw, Info, AlertCircle, PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import UpgradeModal from '../components/UpgradeModal';
import AlertModal from '../components/AlertModal';
import ReassignModal from '../components/ReassignModal';

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
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [routeData, setRouteData] = useState({
        workerId: '',
        date: new Date().toISOString().split('T')[0],
        clientIds: [],
        notes: ''
    });

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, assignmentId: null });
    const [emailModal, setEmailModal] = useState({ isOpen: false, assignmentId: null });
    const [replicateModal, setReplicateModal] = useState({ isOpen: false });
    const [isProcessing, setIsProcessing] = useState(false);
    const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, message: '', upgradeTo: '' });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
    const [reassignModal, setReassignModal] = useState({ isOpen: false, message: '', data: null });

    const [formData, setFormData] = useState({
        clientId: '',
        workerId: '',
        date: '',
        price: '',
        notes: '',
        extraServices: []
    });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchData();
    }, [filterMonth, filterYear, filterWorkerId]);

    const fetchAssignments = async () => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('isDeleted', 'false'); // Filter out deleted assignments
            if (filterWorkerId) {
                queryParams.append('workerId', filterWorkerId);
            }
            queryParams.append('month', filterMonth);
            queryParams.append('year', filterYear);

            const res = await axios.get(`https://glassy-backend.onrender.com/assignments?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (err) {
            console.error("Error fetching assignments:", err);
            // Handle error appropriately
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientRes, workerRes] = await Promise.all([
                axios.get('https://glassy-backend.onrender.com/clients?isDeleted=false', { headers: { Authorization: `Bearer ${token}` } }), // Filter out deleted clients
                axios.get('https://glassy-backend.onrender.com/users/workers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setClients(clientRes.data);
            setWorkers(workerRes.data);
            await fetchAssignments(); // Fetch assignments with current filters
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
                setAlertModal({ isOpen: true, title: '¡Actualizado!', message: 'Asignación actualizada exitosamente.' });
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
            fetchAssignments(); // Refresh assignments after create/update
        } catch (err) {
            if (err.response?.data?.error === 'PLAN_LIMIT_REACHED') {
                setUpgradeModal({ 
                    isOpen: true, 
                    message: err.response.data.message, 
                    upgradeTo: err.response.data.upgrade_to 
                });
                setShowAddModal(false);
            } else if (err.response?.data?.error === 'CLIENT_ALREADY_ASSIGNED') {
                 setReassignModal({
                    isOpen: true,
                    message: err.response.data.message,
                    data: formData
                 });
                 setShowAddModal(false);
            } else {
                setAlertModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || 'Error al procesar servicio' });
            }
        }
    };

    const confirmReassignment = async () => {
        if (!reassignModal.data) return;
        setIsProcessing(true);
        try {
            const formDataWithForce = { ...reassignModal.data, forceReassign: true };
            if (editingId) {
                const res = await axios.put(`https://glassy-backend.onrender.com/assignments/${editingId}`, formDataWithForce, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Find and remove the conflict we just consumed, and update the current one
                setAssignments(prev => {
                    const filtered = prev.filter(a => a._id !== err?.response?.data?.conflictId);
                    return filtered.map(a => a._id === editingId ? res.data : a);
                });
                setAlertModal({ isOpen: true, title: '¡Actualizado!', message: 'Asignación actualizada exitosamente.' });
            } else {
                const res = await axios.post('https://glassy-backend.onrender.com/assignments', formDataWithForce, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // In a creation, the assignment just gets over the conflicted one, let's just fetch everything or update array
                // The backend returned the updated conflicting assignment.
                setAssignments(prev => {
                    const filtered = prev.filter(a => a._id !== res.data._id);
                    return [res.data, ...filtered];
                });
                setAlertModal({ isOpen: true, title: '¡Ruta Reasignada!', message: 'La ruta ha sido unificada y asignada con éxito al nuevo cristalero.' });
            }
            fetchAssignments();
            setReassignModal({ isOpen: false, message: '', data: null });
            setEditingId(null);
            setFormData({ clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: [] });
        } catch (error) {
             setAlertModal({ isOpen: true, title: 'Error', message: 'No se pudo realizar la reasignación.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCreateRoute = async (e) => {
        e.preventDefault();
        if (routeData.clientIds.length === 0) {
             setAlertModal({ isOpen: true, message: 'Selecciona al menos un cliente para la ruta.' });
             return;
        }
        
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
            setAlertModal({ isOpen: true, title: '¡Genial!', message: 'Ruta completa asignada exitosamente' });
        } catch (err) {
            if (err.response?.data?.error === 'PLAN_LIMIT_REACHED') {
                setUpgradeModal({ 
                    isOpen: true, 
                    message: err.response.data.message, 
                    upgradeTo: err.response.data.upgrade_to 
                });
                setShowRouteModal(false);
            } else if (err.response?.data?.error === 'CLIENT_ALREADY_ASSIGNED') {
                 setAlertModal({ isOpen: true, title: 'Conflicto Detectado', message: err.response.data.message + " (Sugerencia: Para evitar duplicados en bloques, actualiza la ruta concreta de ese cliente de forma individual)." });
                 setShowRouteModal(false);
            } else {
                setAlertModal({ isOpen: true, title: 'Error', message: 'Error al asignar ruta completa' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReplicateMonth = async () => {
        if (!replicateModal.isOpen) return;
        setReplicateModal({ isOpen: false });
        
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
                setAlertModal({ isOpen: true, message: 'No hay rutas en el mes anterior para replicar.' });
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
            setAlertModal({ isOpen: true, title: '¡Éxito!', message: `Se han replicado ${prevAssignments.length} rutas con éxito.` });
        } catch (err) {
             if (err.response?.data?.error === 'PLAN_LIMIT_REACHED') {
                setUpgradeModal({ 
                    isOpen: true, 
                    message: err.response.data.message, 
                    upgradeTo: err.response.data.upgrade_to 
                });
            } else if (err.response?.data?.error === 'CLIENT_ALREADY_ASSIGNED') {
                 setAlertModal({ isOpen: true, title: 'Advertencia Parcial', message: 'Algunas rutas han chocado con clientes que ya estaban asignados el mismo día, pero el proceso de replicado se completó o interrumpió parcialmente. Actualiza para verificar.' });
            } else {
                setAlertModal({ isOpen: true, title: 'Error', message: 'Error al replicar el mes.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteAssignment = async () => {
        if (!deleteModal.assignmentId) return;
        setIsProcessing(true);
        try {
            await axios.delete(`https://glassy-backend.onrender.com/assignments/${deleteModal.assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(assignments.filter(a => a._id !== deleteModal.assignmentId));
            setDeleteModal({ isOpen: false, assignmentId: null });
        } catch (err) {
            setAlertModal({ isOpen: true, title: 'Error', message: 'Error al eliminar asignación' });
        } finally {
            setIsProcessing(false);
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
            setAlertModal({ isOpen: true, title: 'Oops', message: 'Error al generar PDF. Asegúrate de tener datos de empresa configurados.' });
        }
    };

    const confirmEmailInvoice = async () => {
        if (!emailModal.assignmentId) return;
        setIsProcessing(true);
        try {
            const res = await axios.post(`https://glassy-backend.onrender.com/assignments/${emailModal.assignmentId}/send-invoice`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlertModal({ isOpen: true, title: 'Email Enviado', message: res.data.message });
        } catch (err) {
            setAlertModal({ isOpen: true, title: 'Error Envío', message: err.response?.data?.message || 'Error al enviar email' });
        } finally {
            setIsProcessing(false);
            setEmailModal({ isOpen: false, assignmentId: null });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completado': return 'bg-green-100 text-green-600 border-green-200';
            case 'cancelado': return 'bg-red-100 text-red-600 border-red-200';
            case 'en_ruta': return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-amber-100 text-amber-600 border-amber-200'; // Pendiente
        }
    };

    const formatStatus = (status) => {
        const statuses = {
            'pendiente': 'Pendiente',
            'en_ruta': 'En Ruta',
            'completado': 'Finalizado/Verde',
            'cancelado': 'Cancelado'
        };
        return statuses[status] || status;
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Filters - Sticky */}
                <div className="sticky top-0 z-[40] bg-[#f8fafc]/90 backdrop-blur-md py-6 -mx-4 px-4 border-b border-white/50 transition-all space-y-6 mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                                onClick={() => setReplicateModal({ isOpen: true })}
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
                                    .filter(as => as.isDeleted !== true)
                                    .filter(as => !filterWorkerId || (as.workerId?._id === filterWorkerId || as.workerId === filterWorkerId))
                                    .filter(as => {
                                        const d = new Date(as.date);
                                        const isSameMonth = (d.getUTCMonth() + 1) === filterMonth && d.getUTCFullYear() === filterYear;
                                        
                                        // Si la asignación NO está completada, y su fecha es anterior o igual al mes filtrado, mostrarla.
                                        // Esto permite que "salte de mes" y siga apareciendo hasta que se complete.
                                        const isActiveAndPast = as.status !== 'completado' && (
                                            d.getUTCFullYear() < filterYear || 
                                            (d.getUTCFullYear() === filterYear && (d.getUTCMonth() + 1) <= filterMonth)
                                        );
                                        
                                        return isSameMonth || isActiveAndPast;
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
                                                {formatStatus(as.status)}
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
                                                            onClick={() => setEmailModal({ isOpen: true, assignmentId: as._id })}
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
                                                    onClick={() => setDeleteModal({ isOpen: true, assignmentId: as._id })}
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
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                             <div className="sticky top-0 bg-white z-10 px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                                <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">{editingId ? 'Editar Asignación' : 'Programar Nueva Ruta'}</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20}/></button>
                             </div>
                             
                             <div className="overflow-y-auto p-10">
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
                             </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Modal de Asignar Ruta Completa (Bulk) */}
            <AnimatePresence>
                {showRouteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                             <div className="sticky top-0 bg-white z-10 px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                                <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">Crear Ruta Completa para Cristalero</h2>
                                <button onClick={() => setShowRouteModal(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20}/></button>
                             </div>
                             
                             <div className="overflow-y-auto p-10">
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
                                     <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Seleccionar Clientes para la Ruta (Múltiples)</label>
                                        <div className="relative w-1/2">
                                            <Search className="absolute left-3 top-2 text-slate-400" size={14} />
                                            <input 
                                                type="text" placeholder="Filtrar por nombre..." 
                                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs shadow-sm"
                                                value={clientSearchQuery}
                                                onChange={(e) => setClientSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-4 bg-slate-50/50 rounded-[30px] border border-slate-100">
                                        {clients.filter(c => c.companyName?.toLowerCase().includes(clientSearchQuery.toLowerCase())).map(c => (
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
                                                <div className="flex flex-col truncate pr-2">
                                                    <span className="font-bold text-xs truncate">{c.companyName}</span>
                                                    <span className="text-[10px] opacity-70 truncate italic">{c.address}</span>
                                                </div>
                                                {routeData.clientIds.includes(c._id) && <CheckCircle2 size={16} />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-[10px] text-slate-400 font-medium">Seleccionados: <span className="text-blue-600 font-bold">{routeData.clientIds.length}</span> clientes.</p>
                                        {clientSearchQuery && <button onClick={() => setClientSearchQuery('')} className="text-[10px] text-blue-500 font-bold">Limpiar búsqueda</button>}
                                    </div>
                                </div>
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
                             </div>
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
                                <div className="sticky top-0 bg-white z-20 p-8 border-b border-slate-50 flex items-center justify-between">
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
                                                                <p className="text-[11px] font-black text-blue-600 uppercase tracking-tight mb-1">{log.workerName || 'Cristalero Desconocido'}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
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

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, assignmentId: null })}
                onConfirm={confirmDeleteAssignment}
                title="¿Eliminar esta asignación/ruta?"
                message="Si ya estaba completada o facturada se marcará como cancelada por seguridad. De lo contrario, se borrará definitivamente."
                confirmText="Sí, Eliminar Asignación"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={emailModal.isOpen}
                onClose={() => setEmailModal({ isOpen: false, assignmentId: null })}
                onConfirm={confirmEmailInvoice}
                title="¿Enviar Factura por Email?"
                message="Se enviará automáticamente la factura al cliente."
                confirmText="Sí, Enviar Factura"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={replicateModal.isOpen}
                onClose={() => setReplicateModal({ isOpen: false })}
                onConfirm={handleReplicateMonth}
                title="¿Replicar todas las rutas?"
                message={`¿Copiar todas las rutas del mes anterior al mes actual?`}
                confirmText="Sí, Replicar Rutas"
                loading={loading}
            />

            <UpgradeModal
                isOpen={upgradeModal.isOpen}
                onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
                message={upgradeModal.message}
                upgradeTo={upgradeModal.upgradeTo}
            />

            <AlertModal 
                isOpen={alertModal.isOpen} 
                onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
                title={alertModal.title}
                message={alertModal.message}
            />

            <ReassignModal
                isOpen={reassignModal.isOpen}
                onClose={() => {
                    setReassignModal({ isOpen: false, message: '', data: null });
                    setEditingId(null);
                }}
                onConfirm={confirmReassignment}
                message={reassignModal.message}
                loading={isProcessing}
            />
        </DashboardLayout>
    );
};

export default Assignments;
