import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Filter, Search, 
  TrendingUp, CreditCard, Calendar, CheckCircle,
  AlertCircle, ChevronRight, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import { Trash2 } from 'lucide-react';

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
            const res = await axios.get('https://glassy-backend.onrender.com/assignments', {
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

    const confirmEmailInvoice = async () => {
        if (!emailModal.invoiceId) return;
        setIsProcessing(true);
        try {
            const res = await axios.post(`https://glassy-backend.onrender.com/assignments/${emailModal.invoiceId}/send-invoice`, {}, {
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
            await axios.delete(`https://glassy-backend.onrender.com/assignments/${deleteModal.invoiceId}`, {
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
        <>
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header - Sticky */}
                <div className="sticky top-0 z-[40] bg-[#f8fafc]/90 backdrop-blur-md py-6 -mx-4 px-4 border-b border-white/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <FileText className="text-blue-600" size={32} /> Facturación y Finanzas
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Historial de servicios completados y facturas generadas.</p>
                    </div>
                </div>

                {/* Billing Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Facturado</p>
                            <p className="text-3xl font-black text-slate-900">{totalInvoiced.toFixed(2)}€</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Servicios Validados</p>
                            <p className="text-3xl font-black text-slate-900">{filteredAssignments.length}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[35px] text-white flex items-center gap-6 overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Plan Pro Activo</p>
                            <p className="text-xl font-bold">Liquidación Mensual</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4 sticky top-[100px] z-[30] backdrop-blur-sm">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                             Historial de Liquidaciones
                        </h2>
                        
                        <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                <Calendar size={14} className="text-blue-500" />
                                <select 
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm p-1 cursor-pointer"
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                >
                                    {Array.from({length: 12}, (_, i) => (
                                        <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('es-ES', {month: 'long'})}</option>
                                    ))}
                                </select>
                                <select 
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm p-1 cursor-pointer border-l pl-2"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                                >
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                </select>
                            </div>

                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input 
                                    type="text" placeholder="Buscar por cliente..." 
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm shadow-sm"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Nº Factura</th>
                                    <th className="px-8 py-5">Cliente</th>
                                    <th className="px-8 py-5">Fecha Servicio</th>
                                    <th className="px-8 py-5 text-right">Importe (con IVA)</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-8 py-6 h-16 bg-slate-50/50"></td></tr>)
                                ) : filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((as) => (
                                        <tr key={as._id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold font-mono text-slate-400">#GL-{as._id.toString().slice(-6).toUpperCase()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{as.clientId?.companyName}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{as.clientId?.address}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                    <Calendar size={14} className="text-slate-300" /> {new Date(as.completedAt || as.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900">
                                                {((as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)) * 1.21).toFixed(2)}€
                                            </td>
                                            <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDownloadPDF(as._id)}
                                                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Descargar Factura PDF"
                                                >
                                                    <Download size={14} /> PDF
                                                </button>
                                                <button 
                                                    onClick={() => setEmailModal({ isOpen: true, invoiceId: as._id })}
                                                    className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Enviar Factura por Email"
                                                >
                                                    <Send size={14} /> Email
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ isOpen: true, invoiceId: as._id })}
                                                    className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Eliminar Factura"
                                                >
                                                    <Trash2 size={14} /> 
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="opacity-20 flex flex-col items-center">
                                                <AlertCircle size={48} className="mb-4" />
                                                <p className="font-bold">No hay facturas disponibles. Completa rutas primero.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>

            <ConfirmModal 
                isOpen={emailModal.isOpen}
                onClose={() => setEmailModal({ isOpen: false, invoiceId: null })}
                onConfirm={confirmEmailInvoice}
                title="¿Enviar Factura por Email?"
                message="Se enviará un correo automáticamente al cliente con el desglose del servicio y copia en formato PDF incrustada."
                confirmText="Sí, Enviar Factura"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, invoiceId: null })}
                onConfirm={confirmDeleteInvoice}
                title="¿Eliminar definitivamente esta factura?"
                message="Esta acción archivará constancia de la prestación de este servicio afectando a los ingresos mensuales reportados. Este paso no se puede deshacer."
                confirmText="Sí, Eliminar Factura"
                loading={isProcessing}
            />
        </>
    );
};

export default Billing;
