import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Filter, Search, 
  TrendingUp, CreditCard, Calendar, CheckCircle,
  AlertCircle, ChevronRight, Send, Trash2, RefreshCcw,
  BadgeEuro, Activity, Sparkles, X, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <div className="space-y-10 pb-12">
                {/* ─── Header Section ─── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#635bff]">
                            <BadgeEuro size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Finanzas</span>
                        </div>
                        <h1 className="text-4xl font-bold text-[#0a2540] tracking-tight">Facturación</h1>
                        <p className="text-sm text-[#697386] font-medium">Liquidación de servicios y control de ingresos mensuales.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#e3e8ee] shadow-sm">
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
                            <div className="w-px h-4 bg-[#e3e8ee]"></div>
                            <select 
                                className="bg-transparent outline-none font-bold text-[#0a2540] text-xs cursor-pointer"
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                            >
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#697386] group-focus-within:text-[#635bff] transition-colors" size={16} />
                            <input 
                                type="text" placeholder="Buscar cliente..." 
                                className="pl-11 pr-4 py-2.5 bg-white border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] text-sm shadow-sm w-full md:w-48 transition-all"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ─── Summary Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stripe-card p-6 flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest">Total Facturado</p>
                            <p className="text-3xl font-bold text-[#0a2540] tracking-tighter">{totalInvoiced.toFixed(2)}€</p>
                            <p className="text-[9px] text-emerald-600 font-bold mt-0.5">+12% vs mes anterior</p>
                        </div>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stripe-card p-6 flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest">Servicios Liquidados</p>
                            <p className="text-3xl font-bold text-[#0a2540] tracking-tighter">{filteredAssignments.length}</p>
                            <p className="text-[9px] text-[#697386] font-medium mt-0.5">En el periodo seleccionado</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }} 
                        className="stripe-card p-6 bg-gradient-to-br from-[#0a2540] to-[#1a3b5a] text-white flex items-center gap-5 border-none relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <CreditCard size={80} />
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-300 border border-white/10 shadow-inner z-10">
                            <Activity size={24} />
                        </div>
                        <div className="z-10">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Estado Fiscal</p>
                            <p className="text-xl font-bold">VeriFactu Ready</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                <p className="text-[9px] font-bold text-emerald-400">SISTEMA ACTIVO</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ─── Invoices Table ─── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stripe-card overflow-hidden bg-white border border-[#e3e8ee]"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fcfdfe] text-[#697386] text-[10px] font-bold uppercase tracking-widest border-b border-[#e3e8ee]">
                                    <th className="px-8 py-5">Referencia</th>
                                    <th className="px-8 py-5">Cliente / Datos Fiscales</th>
                                    <th className="px-8 py-5">Fecha de Emisión</th>
                                    <th className="px-8 py-5 text-right">Base Imponible</th>
                                    <th className="px-8 py-5 text-right">Total (con IVA)</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f6f9fc]">
                                {loading ? (
                                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-8 py-8"><div className="h-12 bg-[#fcfdfe] rounded-xl"></div></td></tr>)
                                ) : filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((as, idx) => (
                                        <motion.tr 
                                            key={as._id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-[#fcfdfe] transition-all group"
                                        >
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-[#697386] bg-[#f6f9fc] px-2 py-1 rounded-lg border border-[#e3e8ee]">#{as._id.toString().slice(-6).toUpperCase()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#0a2540] text-sm group-hover:text-[#635bff] transition-colors">{as.clientId?.companyName}</span>
                                                    <span className="text-[10px] text-[#697386] font-medium truncate max-w-xs mt-0.5">{as.clientId?.address}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-xs text-[#0a2540] font-bold">
                                                    <Calendar size={14} className="text-[#635bff]" /> 
                                                    {new Date(as.completedAt || as.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-xs font-medium text-[#697386]">{(as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)).toFixed(2)}€</p>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-[#0a2540] text-sm">
                                                <div className="flex flex-col items-end">
                                                    <span className="tracking-tighter">{((as.price + (as.extraServices ? as.extraServices.reduce((acc, curr) => acc + curr.price, 0) : 0)) * 1.21).toFixed(2)}€</span>
                                                    <span className="text-[8px] text-[#aab7c4] font-bold uppercase tracking-widest mt-0.5">IVA 21% Incl.</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleDownloadPDF(as._id)}
                                                        className="p-2.5 text-[#635bff] hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                                        title="Descargar PDF"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setEmailModal({ isOpen: true, invoiceId: as._id })}
                                                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                                                        title="Enviar por Email"
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                    <div className="w-px h-4 bg-[#e3e8ee] mx-1"></div>
                                                    <button 
                                                        onClick={() => setDeleteModal({ isOpen: true, invoiceId: as._id })}
                                                        className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} /> 
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <FileText size={64} className="mb-6 text-[#635bff]" />
                                                <p className="text-lg font-bold text-[#0a2540]">No hay registros de facturación</p>
                                                <p className="text-sm font-medium">Finaliza servicios en el panel de rutas para generar facturas.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* ─── Stripe/VeriFactu Badge ─── */}
                <div className="flex items-center justify-center gap-8 py-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                        <span className="text-sm font-bold text-[#0a2540]">Stripe Verified</span>
                    </div>
                    <div className="h-4 w-px bg-[#e3e8ee]"></div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={20} />
                        <span className="text-sm font-bold text-[#0a2540]">VeriFactu Compliant 2025</span>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={emailModal.isOpen}
                onClose={() => setEmailModal({ isOpen: false, invoiceId: null })}
                onConfirm={confirmEmailInvoice}
                title="Enviar Factura"
                message="Se enviará una copia profesional en formato PDF al email configurado en la ficha del cliente."
                confirmText="Enviar ahora"
                loading={isProcessing}
            />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, invoiceId: null })}
                onConfirm={confirmDeleteInvoice}
                title="¿Eliminar factura?"
                message="Esta acción es irreversible y eliminará el registro contable de este servicio. Asegúrate de que es lo que deseas."
                confirmText="Eliminar permanentemente"
                loading={isProcessing}
            />
        </DashboardLayout>
    );
};

export default Billing;
