import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Filter, Search, 
  TrendingUp, CreditCard, Calendar, CheckCircle,
  AlertCircle, ChevronRight, Send, Trash2, RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';

const Billing = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    
    // Estados para Modales de Acción
    const [emailModal, setEmailModal] = useState({ isOpen: false, invoiceId: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, invoiceId: null });
    const [isProcessing, setIsProcessing] = useState(false);

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Solo mostrar los completados en facturación
            setAssignments(res.data.filter(a => a.status === 'completado'));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
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
            alert('Error al generar PDF. Asegúrate de tener datos de empresa configurados.');
        }
    };

    const confirmEmailInvoice = async () => {
        if (!emailModal.invoiceId) return;
        setIsProcessing(true);
        try {
            const res = await axios.post(`https://glassy.es/api/assignments/${emailModal.invoiceId}/send-invoice`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || 'Error al enviar email');
        } finally {
            setIsProcessing(false);
            setEmailModal({ isOpen: false, invoiceId: null });
        }
    };

    const confirmDeleteInvoice = async () => {
        if (!deleteModal.invoiceId) return;
        setIsProcessing(true);
        try {
            await axios.delete(`https://glassy.es/api/assignments/${deleteModal.invoiceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(assignments.filter(a => a._id !== deleteModal.invoiceId));
        } catch (err) {
            alert('Error al eliminar factura');
        } finally {
            setIsProcessing(false);
            setDeleteModal({ isOpen: false, invoiceId: null });
        }
    };

    const filteredAssignments = assignments.filter(a => {
        const d = new Date(a.date);
        const matchMonth = (d.getMonth() + 1) === filterMonth && d.getFullYear() === filterYear;
        const matchSearch = a.clientId?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchMonth && matchSearch;
    });

    const totalInvoiced = filteredAssignments.reduce((acc, curr) => acc + (curr.price || 0) + (curr.extraServices?.reduce((sum, extra) => sum + extra.price, 0) || 0), 0);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Facturación</h1>
                        <p className="text-sm text-[#697386] mt-1">Liquidaciones de servicios y control de ingresos.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e3e8ee] shadow-sm">
                            <Calendar className="text-[#697386]" size={16} />
                            <select 
                                className="bg-transparent outline-none font-bold text-[#0a2540] text-xs uppercase cursor-pointer"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                            >
                                {Array.from({length: 12}, (_, i) => (
                                    <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('es-ES', {month: 'long'})}</option>
                                ))}
                            </select>
                            <select 
                                className="bg-transparent outline-none font-bold text-[#0a2540] text-xs cursor-pointer border-l border-[#e3e8ee] pl-2"
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                            >
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-[#697386]" size={16} />
                            <input 
                                type="text" placeholder="Cliente..." 
                                className="pl-9 pr-4 py-2 bg-white border border-[#e3e8ee] rounded-lg outline-none focus:border-[#635bff] text-sm shadow-sm w-full md:w-40"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Billing Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stripe-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-[#635bff] rounded-xl flex items-center justify-center border border-indigo-100">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">Total Facturado</p>
                            <p className="text-2xl font-bold text-[#0a2540]">{totalInvoiced.toFixed(2)}€</p>
                        </div>
                    </div>
                    <div className="stripe-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">Servicios Mes</p>
                            <p className="text-2xl font-bold text-[#0a2540]">{filteredAssignments.length}</p>
                        </div>
                    </div>
                    <div className="stripe-card p-6 bg-[#0a2540] text-white flex items-center gap-4 overflow-hidden relative border-none shadow-none">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400">
                            <CreditCard size={24} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Facturación Activa</p>
                            <p className="text-lg font-bold">Liquidación Pro</p>
                        </div>
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="stripe-card overflow-hidden bg-white border border-[#e3e8ee]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fcfdfe] text-[#697386] text-[10px] font-bold uppercase tracking-wider border-b border-[#e3e8ee]">
                                    <th className="px-6 py-4">ID Factura</th>
                                    <th className="px-6 py-4">Cliente / Dirección</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right">Total (con IVA)</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f6f9fc]">
                                {loading ? (
                                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-6 py-8 h-16 bg-[#fcfdfe]"></td></tr>)
                                ) : filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((as) => (
                                        <tr key={as._id} className="hover:bg-[#fcfdfe] transition-all group">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-[#697386]">#{as._id.toString().slice(-6).toUpperCase()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#0a2540] text-sm">{as.clientId?.companyName}</span>
                                                    <span className="text-[10px] text-[#697386] font-medium truncate max-w-xs">{as.clientId?.address}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-[#0a2540] font-semibold">
                                                    <Calendar size={14} className="text-[#697386]" /> {new Date(as.completedAt || as.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-[#0a2540]">
                                                {((as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)) * 1.21).toFixed(2)}€
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleDownloadPDF(as._id)}
                                                        className="p-2 text-[#635bff] hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="PDF"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setEmailModal({ isOpen: true, invoiceId: as._id })}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Email"
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteModal({ isOpen: true, invoiceId: as._id })}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Borrar"
                                                    >
                                                        <Trash2 size={18} /> 
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <FileText size={48} className="mb-4" />
                                                <p className="text-sm font-bold">No hay servicios liquidados este mes.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={emailModal.isOpen}
                onClose={() => setEmailModal({ isOpen: false, invoiceId: null })}
                onConfirm={confirmEmailInvoice}
                title="Enviar Factura"
                message="Se enviará una copia PDF al email del cliente."
                confirmText="Enviar ahora"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, invoiceId: null })}
                onConfirm={confirmDeleteInvoice}
                title="¿Eliminar factura?"
                message="Esta acción no se puede deshacer."
                confirmText="Eliminar"
                loading={isProcessing}
            />
        </DashboardLayout>
    );
};

export default Billing;
