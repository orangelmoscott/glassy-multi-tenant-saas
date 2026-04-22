import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, CheckCircle, CheckCircle2, Clock, MapPin, 
  MoreHorizontal, Plus, Search, User, FileText, 
  Trash2, Edit2, Play, Download, ChevronRight, X, Phone, Send,
  RefreshCcw, Info, AlertCircle, PenTool, Save, Filter, History, Map
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
    const [editingExtraIdx, setEditingExtraIdx] = useState(null);
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
            queryParams.append('isDeleted', 'false');
            if (filterWorkerId) queryParams.append('workerId', filterWorkerId);
            queryParams.append('month', filterMonth);
            queryParams.append('year', filterYear);

            const res = await axios.get(`https://glassy.es/api/assignments?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (err) {
            console.error("Error fetching assignments:", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientRes, workerRes] = await Promise.all([
                axios.get('https://glassy.es/api/clients?isDeleted=false', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('https://glassy.es/api/users/workers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setClients(clientRes.data);
            setWorkers(workerRes.data);
            await fetchAssignments();
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
                const res = await axios.put(`https://glassy.es/api/assignments/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments(assignments.map(a => a._id === editingId ? res.data : a));
                setAlertModal({ isOpen: true, title: '¡Actualizado!', message: 'Asignación actualizada exitosamente.' });
            } else {
                const res = await axios.post('https://glassy.es/api/assignments', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments([res.data, ...assignments]);
            }
            setShowAddModal(false);
            setEditingId(null);
            setFormData({ clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: [] });
            fetchAssignments();
        } catch (err) {
            if (err.response?.data?.error === 'PLAN_LIMIT_REACHED') {
                setUpgradeModal({ isOpen: true, message: err.response.data.message, upgradeTo: err.response.data.upgrade_to });
                setShowAddModal(false);
            } else if (err.response?.data?.error === 'CLIENT_ALREADY_ASSIGNED') {
                 setReassignModal({ isOpen: true, message: err.response.data.message, data: formData });
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
            const res = await axios.post('https://glassy.es/api/assignments', formDataWithForce, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(prev => {
                const filtered = prev.filter(a => a._id !== res.data._id);
                return [res.data, ...filtered];
            });
            setAlertModal({ isOpen: true, title: '¡Ruta Reasignada!', message: 'La ruta ha sido unificada y asignada con éxito.' });
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
        setLoading(true);
        try {
            const promises = routeData.clientIds.map(clientId => {
                const client = clients.find(c => c._id === clientId);
                return axios.post('https://glassy.es/api/assignments', {
                    clientId,
                    workerId: routeData.workerId,
                    date: routeData.date,
                    notes: routeData.notes,
                    price: client ? client.basePrice : 0
                }, { headers: { Authorization: `Bearer ${token}` } });
            });
            await Promise.all(promises);
            fetchAssignments();
            setShowRouteModal(false);
            setRouteData({ workerId: '', date: '', clientIds: [], notes: '' });
            setAlertModal({ isOpen: true, title: '¡Ruta Creada!', message: 'Ruta completa asignada exitosamente' });
        } catch (err) {
            setAlertModal({ isOpen: true, title: 'Error', message: 'Error al asignar ruta completa' });
        } finally {
            setLoading(false);
        }
    };

    const handleReplicateMonth = async () => {
        setReplicateModal({ isOpen: false });
        setLoading(true);
        try {
            const prevMonth = filterMonth === 1 ? 12 : filterMonth - 1;
            const prevYear = filterMonth === 1 ? filterYear - 1 : filterYear;
            const res = await axios.get('https://glassy.es/api/assignments', { headers: { Authorization: `Bearer ${token}` } });
            const prevAssignments = res.data.filter(as => {
                const d = new Date(as.date);
                return (d.getMonth() + 1) === prevMonth && d.getFullYear() === prevYear && !as.isDeleted;
            });

            if (prevAssignments.length === 0) {
                setAlertModal({ isOpen: true, message: 'No hay rutas en el mes anterior para replicar.' });
                setLoading(false);
                return;
            }

            const promises = prevAssignments.map(as => {
                const newDate = new Date(filterYear, filterMonth - 1, new Date(as.date).getDate());
                return axios.post('https://glassy.es/api/assignments', {
                    clientId: as.clientId?._id || as.clientId,
                    workerId: as.workerId?._id || as.workerId,
                    date: newDate,
                    notes: as.notes,
                    price: as.price
                }, { headers: { Authorization: `Bearer ${token}` } });
            });

            await Promise.all(promises);
            fetchAssignments();
            setAlertModal({ isOpen: true, title: '¡Éxito!', message: `Se han replicado ${prevAssignments.length} rutas.` });
        } catch (err) {
            setAlertModal({ isOpen: true, title: 'Error', message: 'Error al replicar el mes.' });
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteAssignment = async () => {
        if (!deleteModal.assignmentId) return;
        setIsProcessing(true);
        try {
            await axios.delete(`https://glassy.es/api/assignments/${deleteModal.assignmentId}`, {
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
            const response = await axios.get(`https://glassy.es/api/assignments/${id}/invoice`, {
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
            setAlertModal({ isOpen: true, title: 'Oops', message: 'Error al generar PDF.' });
        }
    };

    const confirmEmailInvoice = async () => {
        if (!emailModal.assignmentId) return;
        setIsProcessing(true);
        try {
            await axios.post(`https://glassy.es/api/assignments/${emailModal.assignmentId}/send-invoice`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlertModal({ isOpen: true, title: 'Enviado', message: 'Factura enviada correctamente al cliente.' });
        } catch (err) {
            setAlertModal({ isOpen: true, title: 'Error', message: 'No se pudo enviar la factura.' });
        } finally {
            setIsProcessing(false);
            setEmailModal({ isOpen: false, assignmentId: null });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'cancelado': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'en_ruta': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const formatStatus = (status) => {
        const statuses = { 'pendiente': 'Pendiente', 'en_ruta': 'En Ruta', 'completado': 'Finalizado', 'cancelado': 'Cancelado' };
        return statuses[status] || status;
    };

    const filteredList = assignments
        .filter(as => as.isDeleted !== true)
        .filter(as => !filterWorkerId || (as.workerId?._id === filterWorkerId || as.workerId === filterWorkerId))
        .filter(as => {
            const d = new Date(as.date);
            const isSameMonth = (d.getUTCMonth() + 1) === filterMonth && d.getUTCFullYear() === filterYear;
            const isActiveAndPast = as.status !== 'completado' && (
                d.getUTCFullYear() < filterYear || 
                (d.getUTCFullYear() === filterYear && (d.getUTCMonth() + 1) <= filterMonth)
            );
            return isSameMonth || isActiveAndPast;
        });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Rutas y Servicios</h1>
                        <p className="text-sm text-[#697386] mt-1">Planificación logística y seguimiento de operarios.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button 
                            onClick={() => setShowRouteModal(true)}
                            className="bg-white border border-[#e3e8ee] text-[#0a2540] px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#f6f9fc] transition-all shadow-sm"
                        >
                            <Map size={18} /> Asignar Ruta Completa
                        </button>
                        <button 
                            onClick={() => setReplicateModal({ isOpen: true })}
                            className="bg-white border border-[#e3e8ee] text-[#0a2540] px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#f6f9fc] transition-all shadow-sm"
                        >
                            <RefreshCcw size={18} /> Replicar Mes
                        </button>
                        <button 
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: [] });
                                setShowAddModal(true);
                            }}
                            className="bg-[#635bff] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#4f46e5] transition-all shadow-lg shadow-indigo-100"
                        >
                            <Plus size={18} /> Nuevo Servicio
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stripe-card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-[#635bff] rounded-xl flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">Total Rutas</p>
                            <p className="text-xl font-bold text-[#0a2540]">{filteredList.length}</p>
                        </div>
                    </div>

                    <div className="stripe-card p-4 flex items-center gap-3">
                        <Calendar size={18} className="text-[#635bff] ml-1" />
                        <div className="flex-1 flex gap-2">
                            <select 
                                className="bg-transparent border-none outline-none font-bold text-[#0a2540] text-sm w-full cursor-pointer"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                            >
                                {Array.from({length: 12}, (_, i) => (
                                    <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('es-ES', {month: 'long'})}</option>
                                ))}
                            </select>
                            <select 
                                className="bg-transparent border-none outline-none font-bold text-[#0a2540] text-sm cursor-pointer"
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                            >
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="stripe-card p-4 md:col-span-1 lg:col-span-2 flex items-center gap-3">
                        <User size={18} className="text-[#635bff] ml-1" />
                        <select 
                            className="bg-transparent border-none outline-none font-bold text-[#0a2540] text-sm w-full cursor-pointer"
                            value={filterWorkerId}
                            onChange={(e) => setFilterWorkerId(e.target.value)}
                        >
                            <option value="">Todos los cristaleros</option>
                            {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                        </select>
                    </div>
                </div>

                {/* Main Table */}
                <div className="stripe-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fcfdfe] border-b border-[#e3e8ee]">
                                    <th className="px-6 py-4 text-[10px] font-bold text-[#697386] uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[#697386] uppercase tracking-wider">Operario / Progreso</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[#697386] uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[#697386] uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[#697386] uppercase tracking-wider text-right">Importe</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[#697386] uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f6f9fc]">
                                {loading ? (
                                    [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-4"><div className="h-10 bg-[#f6f9fc] rounded-lg"></div></td></tr>)
                                ) : filteredList.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center opacity-30"><Calendar size={48} className="mx-auto mb-4" /><p className="font-bold">No hay rutas programadas.</p></td></tr>
                                ) : (
                                    filteredList.map((as) => (
                                        <tr key={as._id} className="hover:bg-[#fcfdfe] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#635bff] group-hover:scale-110 transition-transform">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="max-w-[200px]">
                                                        <p className="font-bold text-[#0a2540] truncate">{as.clientId?.companyName || 'Cliente Desc.'}</p>
                                                        <p className="text-[10px] text-[#697386] truncate">{as.clientId?.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <p className="text-xs font-bold text-[#0a2540] flex items-center gap-1.5"><User size={12} className="text-[#635bff]" /> {as.workerId?.fullName || 'Sin asignar'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee]">
                                                            <div className="h-full bg-[#635bff] transition-all" style={{ width: `${Math.min(((as.visitsDone || 0) / (as.expectedVisits || 1)) * 100, 100)}%` }}></div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setSelectedAssignmentForLogs(as)}
                                                            className="text-[10px] font-bold text-[#635bff] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1 hover:bg-[#635bff] hover:text-white transition-all"
                                                        >
                                                            {as.visitsDone || 0}/{as.expectedVisits || 1} <Info size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-[#0a2540]">{new Date(as.date).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-[#697386] font-medium flex items-center gap-1 mt-0.5"><Clock size={10} /> {as.status === 'completado' ? 'Finalizado' : 'Pendiente'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(as.status)}`}>
                                                    {formatStatus(as.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-[#0a2540]">{(as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)).toFixed(2)}€</p>
                                                {as.extraServices?.length > 0 && <span className="text-[8px] bg-indigo-50 text-[#635bff] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-indigo-100">+ EXTRAS</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {as.status === 'completado' && (
                                                        <>
                                                            <button onClick={() => handleDownloadPDF(as._id)} className="p-2 text-[#697386] hover:text-[#635bff] hover:bg-[#f6f9fc] rounded-lg transition-all" title="PDF"><Download size={16}/></button>
                                                            <button onClick={() => setEmailModal({ isOpen: true, assignmentId: as._id })} className="p-2 text-[#697386] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Email"><Send size={16}/></button>
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
                                                        className="p-2 text-[#697386] hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    ><Edit2 size={16}/></button>
                                                    <button onClick={() => setDeleteModal({ isOpen: true, assignmentId: as._id })} className="p-2 text-[#697386] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals are unchanged in logic, but their styling in ConfirmModal/AlertModal/etc is already Stripe-themed */}
            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, assignmentId: null })}
                onConfirm={confirmDeleteAssignment}
                title="¿Eliminar asignación?"
                message="Se borrará el registro de la ruta. Los logs de visitas ya realizados se mantendrán en el historial del cliente."
                confirmText="Eliminar"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={emailModal.isOpen}
                onClose={() => setEmailModal({ isOpen: false, assignmentId: null })}
                onConfirm={confirmEmailInvoice}
                title="Enviar Factura"
                message="¿Enviar por email la factura de este servicio al cliente?"
                confirmText="Enviar ahora"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={replicateModal.isOpen}
                onClose={() => setReplicateModal({ isOpen: false })}
                onConfirm={handleReplicateMonth}
                title="Replicar Mes Anterior"
                message={`¿Deseas copiar todas las rutas del mes anterior (${filterMonth === 1 ? 12 : filterMonth - 1}/${filterMonth === 1 ? filterYear - 1 : filterYear}) al mes actual?`}
                confirmText="Sí, replicar"
                loading={loading}
            />

            {/* Form Modal (Add/Edit) */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
                            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#fcfdfe]">
                                <h2 className="text-xl font-bold text-[#0a2540]">{editingId ? 'Editar Asignación' : 'Programar Servicio'}</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[#f6f9fc] rounded-xl transition-all text-[#697386]"><X size={20}/></button>
                            </div>
                            <div className="overflow-y-auto p-8 space-y-6">
                                <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Cliente</label>
                                            <select 
                                                required className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540] appearance-none"
                                                value={formData.clientId}
                                                onChange={(e) => {
                                                    const cId = e.target.value;
                                                    const c = clients.find(cl => cl._id === cId);
                                                    setFormData({ ...formData, clientId: cId, price: c ? c.basePrice : 0 });
                                                }}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {clients.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Operario</label>
                                            <select 
                                                required className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540] appearance-none"
                                                value={formData.workerId}
                                                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Fecha</label>
                                        <input type="date" required className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Notas / Instrucciones</label>
                                        <textarea 
                                            className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] text-sm font-medium min-h-[80px]"
                                            value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>

                                    {/* Price Card */}
                                    <div className="p-6 bg-[#0a2540] rounded-2xl text-center space-y-1 shadow-xl shadow-indigo-100">
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Importe Total</p>
                                        <p className="text-4xl font-bold text-white">{(parseFloat(formData.price || 0) + formData.extraServices.reduce((a, b) => a + b.price, 0)).toFixed(2)}€</p>
                                    </div>

                                    <button className="w-full bg-[#635bff] text-white py-4 rounded-2xl font-bold hover:bg-[#4f46e5] shadow-lg shadow-indigo-100 transition-all active:scale-95">
                                        {editingId ? 'Actualizar Asignación' : 'Confirmar Asignación'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Route Modal */}
            <AnimatePresence>
                {showRouteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
                            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#fcfdfe]">
                                <h2 className="text-xl font-bold text-[#0a2540]">Asignar Ruta Completa</h2>
                                <button onClick={() => setShowRouteModal(false)} className="p-2 hover:bg-[#f6f9fc] rounded-xl transition-all text-[#697386]"><X size={20}/></button>
                            </div>
                            <div className="overflow-y-auto p-8 space-y-6">
                                <form onSubmit={handleCreateRoute} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Cristalero</label>
                                            <select 
                                                required className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]"
                                                value={routeData.workerId}
                                                onChange={(e) => setRouteData({ ...routeData, workerId: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Fecha de Inicio</label>
                                            <input type="date" required className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]" value={routeData.date} onChange={(e) => setRouteData({ ...routeData, date: e.target.value })} />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Seleccionar Clientes</label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-2.5 text-[#aab7c4]" size={16} />
                                            <input 
                                                type="text" placeholder="Buscar clientes..." 
                                                onChange={(e) => setClientSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-[#f6f9fc] border border-[#e3e8ee] rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 bg-[#fcfdfe] border border-[#e3e8ee] rounded-xl">
                                            {clients
                                                .filter(c => c.companyName.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                                                .map(c => (
                                                    <label key={c._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${routeData.clientIds.includes(c._id) ? 'bg-indigo-50 border-[#635bff] text-[#635bff]' : 'bg-white border-[#e3e8ee] text-[#0a2540] hover:bg-[#f6f9fc]'}`}>
                                                        <input 
                                                            type="checkbox" className="hidden"
                                                            checked={routeData.clientIds.includes(c._id)}
                                                            onChange={(e) => {
                                                                const ids = e.target.checked 
                                                                    ? [...routeData.clientIds, c._id]
                                                                    : routeData.clientIds.filter(id => id !== c._id);
                                                                setRouteData({ ...routeData, clientIds: ids });
                                                            }}
                                                        />
                                                        <span className="text-xs font-bold truncate">{c.companyName}</span>
                                                    </label>
                                                ))}
                                        </div>
                                    </div>

                                    <button className="w-full bg-[#635bff] text-white py-4 rounded-2xl font-bold hover:bg-[#4f46e5] shadow-lg shadow-indigo-100 transition-all active:scale-95">
                                        Asignar Ruta ({routeData.clientIds.length} clientes)
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <UpgradeModal isOpen={upgradeModal.isOpen} onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })} message={upgradeModal.message} upgradeTo={upgradeModal.upgradeTo} />
            <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} title={alertModal.title} message={alertModal.message} />
            <ReassignModal isOpen={reassignModal.isOpen} onClose={() => setReassignModal({ ...reassignModal, isOpen: false })} message={reassignModal.message} onConfirm={confirmReassignment} loading={isProcessing} />
        </DashboardLayout>
    );
};

export default Assignments;
