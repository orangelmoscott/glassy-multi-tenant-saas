import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, CheckCircle, CheckCircle2, Clock, MapPin, 
  MoreHorizontal, Plus, Search, User, FileText, 
  Trash2, Edit2, Play, Download, ChevronRight, X, Phone, Send,
  RefreshCcw, Info, AlertCircle, PenTool, Save, Filter, History, Map,
  Sparkles, Layers, ListChecks, Navigation
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
            <div className="space-y-8 pb-12">
                {/* ─── Header Section ─── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#635bff]">
                            <Navigation size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Operaciones</span>
                        </div>
                        <h1 className="text-4xl font-bold text-[#0a2540] tracking-tight">Rutas y Servicios</h1>
                        <p className="text-sm text-[#697386] font-medium">Planificación logística y seguimiento en tiempo real.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button 
                            onClick={() => setShowRouteModal(true)}
                            className="bg-white border border-[#e3e8ee] text-[#0a2540] px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#f6f9fc] hover:border-[#635bff]/30 transition-all shadow-sm uppercase tracking-wider"
                        >
                            <Layers size={16} className="text-[#635bff]" /> Asignar Ruta Completa
                        </button>
                        <button 
                            onClick={() => setReplicateModal({ isOpen: true })}
                            className="bg-white border border-[#e3e8ee] text-[#0a2540] px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#f6f9fc] hover:border-[#635bff]/30 transition-all shadow-sm uppercase tracking-wider"
                        >
                            <RefreshCcw size={16} className="text-[#635bff]" /> Replicar Mes
                        </button>
                        <button 
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ clientId: '', workerId: '', date: '', price: 0, notes: '', extraServices: [] });
                                setShowAddModal(true);
                            }}
                            className="bg-[#635bff] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#0a2540] transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
                        >
                            <Plus size={18} /> Nuevo Servicio
                        </button>
                    </div>
                </div>

                {/* ─── Control Bar ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stripe-card p-4 flex items-center gap-4 bg-white">
                        <div className="w-12 h-12 bg-indigo-50 text-[#635bff] rounded-xl flex items-center justify-center border border-indigo-100">
                            <ListChecks size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest">Total Rutas</p>
                            <p className="text-2xl font-bold text-[#0a2540] tracking-tighter">{filteredList.length}</p>
                        </div>
                    </div>

                    <div className="stripe-card p-4 flex items-center gap-3 bg-white">
                        <Calendar size={18} className="text-[#635bff] ml-1" />
                        <div className="flex-1 flex gap-2">
                            <select 
                                className="bg-transparent border-none outline-none font-bold text-[#0a2540] text-xs uppercase cursor-pointer"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                            >
                                {Array.from({length: 12}, (_, i) => (
                                    <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('es-ES', {month: 'long'})}</option>
                                ))}
                            </select>
                            <div className="w-px h-4 bg-[#e3e8ee]"></div>
                            <select 
                                className="bg-transparent border-none outline-none font-bold text-[#0a2540] text-xs cursor-pointer"
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                            >
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="stripe-card p-4 md:col-span-1 lg:col-span-2 flex items-center gap-4 bg-white">
                        <User size={18} className="text-[#635bff] ml-1" />
                        <select 
                            className="bg-transparent border-none outline-none font-bold text-[#0a2540] text-xs uppercase tracking-widest w-full cursor-pointer"
                            value={filterWorkerId}
                            onChange={(e) => setFilterWorkerId(e.target.value)}
                        >
                            <option value="">Todos los operarios</option>
                            {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                        </select>
                    </div>
                </div>

                {/* ─── Main Table ─── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stripe-card overflow-hidden bg-white"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fcfdfe] border-b border-[#e3e8ee]">
                                    <th className="px-8 py-5 text-[10px] font-bold text-[#697386] uppercase tracking-widest">Cliente</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-[#697386] uppercase tracking-widest">Operario & Progreso</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-[#697386] uppercase tracking-widest">Planificación</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-[#697386] uppercase tracking-widest">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-[#697386] uppercase tracking-widest text-right">Importe</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-[#697386] uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f6f9fc]">
                                {loading ? (
                                    [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-8 py-6"><div className="h-12 bg-[#f6f9fc] rounded-xl"></div></td></tr>)
                                ) : filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <Calendar size={64} className="mb-6 text-[#635bff]" />
                                                <p className="text-lg font-bold text-[#0a2540]">No hay rutas programadas</p>
                                                <p className="text-sm font-medium">Empieza asignando servicios a tus operarios.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((as, idx) => (
                                        <motion.tr 
                                            key={as._id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-[#fcfdfe] transition-colors group border-transparent border-l-4 hover:border-l-[#635bff]"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#635bff] group-hover:scale-110 transition-transform shadow-sm border border-indigo-100">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div className="max-w-[250px]">
                                                        <p className="font-bold text-[#0a2540] text-sm truncate">{as.clientId?.companyName || 'Cliente Desc.'}</p>
                                                        <p className="text-[10px] text-[#697386] font-medium truncate mt-0.5">{as.clientId?.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-[#0a2540] flex items-center gap-2">
                                                        <User size={14} className="text-[#635bff]" /> 
                                                        {as.workerId?.fullName || 'Sin asignar'}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee] relative">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(((as.visitsDone || 0) / (as.expectedVisits || 1)) * 100, 100)}%` }}
                                                                className="h-full bg-gradient-to-r from-[#635bff] to-[#4f46e5] rounded-full" 
                                                            />
                                                        </div>
                                                        <button 
                                                            onClick={() => setSelectedAssignmentForLogs(as)}
                                                            className="text-[9px] font-bold text-[#635bff] bg-white px-2 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5 hover:bg-[#635bff] hover:text-white transition-all shadow-sm"
                                                        >
                                                            {as.visitsDone || 0}/{as.expectedVisits || 1} <Info size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-[#0a2540] tracking-tight">{new Date(as.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {as.status === 'completado' ? (
                                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Finalizado</span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 italic">Programado</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(as.status)}`}>
                                                    {formatStatus(as.status)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-base font-bold text-[#0a2540] tracking-tighter">{(as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)).toFixed(2)}€</p>
                                                {as.extraServices?.length > 0 && (
                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <Sparkles size={10} className="text-[#635bff]" />
                                                        <span className="text-[8px] font-bold text-[#635bff] uppercase tracking-widest">Incluye Extras</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {as.status === 'completado' && (
                                                        <>
                                                            <button onClick={() => handleDownloadPDF(as._id)} className="p-2.5 text-[#697386] hover:text-[#635bff] hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-[#e3e8ee]" title="PDF"><Download size={18}/></button>
                                                            <button onClick={() => setEmailModal({ isOpen: true, assignmentId: as._id })} className="p-2.5 text-[#697386] hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-[#e3e8ee]" title="Email"><Send size={18}/></button>
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
                                                        className="p-2.5 text-[#697386] hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-[#e3e8ee]"
                                                    ><Edit2 size={18}/></button>
                                                    <button onClick={() => setDeleteModal({ isOpen: true, assignmentId: as._id })} className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Modals styles improved in separate components or generic modal system */}
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-[#0a2540]/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                        >
                            <div className="p-8 border-b border-[#e3e8ee] flex items-center justify-between bg-white relative">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-[#0a2540] tracking-tight">{editingId ? 'Editar Asignación' : 'Nuevo Servicio'}</h2>
                                    <p className="text-xs text-[#697386] font-medium">Configura los detalles del trabajo logístico.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-[#f6f9fc] rounded-2xl transition-all text-[#697386] border border-transparent hover:border-[#e3e8ee]"><X size={24}/></button>
                            </div>
                            
                            <div className="overflow-y-auto p-10 space-y-8">
                                <form onSubmit={handleCreateOrUpdate} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Cliente Receptor</label>
                                            <div className="relative">
                                                <select 
                                                    required className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] appearance-none transition-all"
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
                                                <div className="absolute right-5 top-5 pointer-events-none text-[#697386]">
                                                    <ChevronRight size={18} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Operario Asignado</label>
                                            <div className="relative">
                                                <select 
                                                    required className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] appearance-none transition-all"
                                                    value={formData.workerId}
                                                    onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
                                                </select>
                                                <div className="absolute right-5 top-5 pointer-events-none text-[#697386]">
                                                    <ChevronRight size={18} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Fecha Programada</label>
                                            <input 
                                                type="date" required 
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all" 
                                                value={formData.date} 
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Importe Base (€)</label>
                                            <input 
                                                type="number" step="0.01" required 
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all" 
                                                value={formData.price} 
                                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Notas e Instrucciones</label>
                                        <textarea 
                                            className="w-full px-6 py-5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-3xl outline-none focus:border-[#635bff] focus:bg-white text-sm font-medium min-h-[120px] transition-all resize-none"
                                            placeholder="Detalles específicos para el operario..."
                                            value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>

                                    <div className="p-8 bg-gradient-to-br from-[#0a2540] to-[#1a3b5a] rounded-3xl text-center space-y-2 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                            <Sparkles size={100} className="text-white" />
                                        </div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest relative z-10">Total Estimado (Sin IVA)</p>
                                        <p className="text-5xl font-bold text-white tracking-tighter relative z-10">{(parseFloat(formData.price || 0) + formData.extraServices.reduce((a, b) => a + b.price, 0)).toFixed(2)}€</p>
                                    </div>

                                    <button className="w-full bg-[#635bff] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-[#0a2540] shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                        {editingId ? 'Actualizar Registro' : 'Confirmar y Guardar'}
                                        <ChevronRight size={18} />
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
