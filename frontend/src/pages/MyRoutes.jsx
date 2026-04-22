import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Calendar, MapPin, Phone, Info, CheckCircle, 
  X, PenTool, Save, Trash2, ChevronRight, Clock, FileText,
  RefreshCcw, Plus, Search, Map as MapIcon, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import RouteMap from '../components/RouteMap';

const MyRoutes = () => {
    const [assignments, setAssignments] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('pendientes');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isSigning, setIsSigning] = useState(false);
    const [currentExtras, setCurrentExtras] = useState([]); 
    const [newExtra, setNewExtra] = useState({ description: '', price: '' });
    const sigPad = useRef({});

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchMyAssignments();
        fetchMyHistory();
    }, []);

    const fetchMyAssignments = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/assignments/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setAssignments(data);
            
            if (data.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const datesWithWork = [...new Set(data.map(a => new Date(a.date).toISOString().split('T')[0]))].sort();
                
                if (datesWithWork.includes(today)) {
                    setSelectedDate(today);
                } else if (datesWithWork.length > 0) {
                    setSelectedDate(datesWithWork[0]);
                }
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const uniqueDates = [...new Set(assignments.map(a => new Date(a.date).toISOString().split('T')[0]))].sort();
    const filteredAssignments = assignments.filter(a => new Date(a.date).toISOString().split('T')[0] === selectedDate);

    const fetchMyHistory = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/assignments/my-history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const clearSignature = () => sigPad.current?.clear && sigPad.current.clear();

    const handleComplete = async () => {
        const isLastVisit = !selectedJob ? false : ((selectedJob.visitsDone || 0) + 1 >= (selectedJob.expectedVisits || 1));
        
        if (!sigPad.current || sigPad.current.isEmpty()) {
            alert('Por favor, ingresa la firma del cliente para validar la limpieza.');
            return;
        }

        const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        
        try {
            const body = {
                signature: signatureBase64,
                notes: isLastVisit ? 'Trabajo mensual finalizado y validado.' : 'Visita registrada con validación de firma.',
                extraServices: currentExtras
            };

            await axios.patch(`https://glassy.es/api/assignments/${selectedJob._id}/complete`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (isLastVisit) {
                setAssignments(assignments.filter(a => a._id !== selectedJob._id));
            } else {
                setAssignments(assignments.map(a => a._id === selectedJob._id ? {
                      ...a, 
                      visitsDone: (a.visitsDone || 0) + 1,
                      status: 'en_ruta',
                      progressInfo: {
                          ...a.progressInfo,
                          text: `${(a.visitsDone || 0) + 1}/${a.expectedVisits || 1} este servicio`
                      }
                  } : a));
            }
            
            setIsSigning(false);
            setSelectedJob(null);
            setCurrentExtras([]);
        } catch (err) {
            alert('Error al validar el servicio.');
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completado': return { label: 'Finalizado', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
            case 'en_ruta': return { label: 'En Ruta', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
            default: return { label: 'Pendiente', color: 'bg-amber-50 text-amber-600 border-amber-100' };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* User Info Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#635bff] to-[#0a2540] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-100">
                            {user.fullName?.charAt(0) || user.username?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0a2540]">{user.fullName || user.username}</h1>
                            <p className="text-sm text-[#697386] font-medium flex items-center gap-2">
                                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{user.role}</span>
                                {user.companyName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date Selector Horizontal */}
                {activeTab === 'pendientes' && uniqueDates.length > 0 && (
                    <div className="space-y-3 overflow-hidden">
                        <p className="text-[10px] font-bold text-[#697386] uppercase tracking-wider ml-1">Mi Calendario</p>
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {uniqueDates.map(dateStr => (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`flex flex-col items-center min-w-[100px] p-4 rounded-2xl transition-all border ${
                                        selectedDate === dateStr 
                                        ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-lg' 
                                        : 'bg-white text-[#697386] border-[#e3e8ee] hover:border-[#635bff]'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                                        {new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}
                                    </span>
                                    <span className="text-xl font-bold">{new Date(dateStr + 'T12:00:00').getDate()}</span>
                                    <span className="text-[10px] font-bold uppercase opacity-60">
                                        {new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex bg-[#f6f9fc] p-1 rounded-xl w-fit">
                    {[
                        { id: 'pendientes', label: 'Rutas', icon: Clock },
                        { id: 'mapa', label: 'Mapa', icon: MapIcon },
                        { id: 'historial', label: 'Historial', icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-[#0a2540] shadow-sm' 
                                : 'text-[#697386] hover:text-[#0a2540]'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'mapa' ? (
                        <div className="stripe-card h-[500px] overflow-hidden p-0 border-none">
                            <RouteMap assignments={filteredAssignments} />
                        </div>
                    ) : activeTab === 'pendientes' ? (
                        <div className="grid grid-cols-1 gap-4">
                            {loading ? (
                                [1,2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-[#e3e8ee]"></div>)
                            ) : filteredAssignments.length === 0 ? (
                                <div className="stripe-card p-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0a2540]">¡Todo al día!</h3>
                                    <p className="text-[#697386] font-medium max-w-xs mt-2">No tienes rutas pendientes para esta fecha.</p>
                                </div>
                            ) : (
                                filteredAssignments.map((job) => (
                                    <motion.div 
                                        key={job._id}
                                        whileHover={{ y: -2 }}
                                        onClick={() => setSelectedJob(job)}
                                        className="stripe-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:border-[#635bff] group"
                                    >
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusInfo(job.status).color}`}>
                                                    {getStatusInfo(job.status).label}
                                                </span>
                                                {job.progressInfo && (
                                                    <span className="bg-[#0a2540] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                                                        {job.progressInfo.text}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#0a2540] group-hover:text-[#635bff] transition-colors">{job.clientId?.companyName}</h3>
                                                <div className="flex items-center gap-2 text-sm text-[#697386] font-medium mt-1">
                                                    <MapPin size={14} className="text-[#635bff]" />
                                                    {job.clientId?.address}
                                                </div>
                                            </div>
                                            {job.expectedVisits > 1 && (
                                                <div className="w-full max-w-xs h-1.5 bg-[#f6f9fc] rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#635bff] rounded-full"
                                                        style={{ width: `${Math.min(((job.visitsDone || 0) / (job.expectedVisits || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-[#f6f9fc] group-hover:bg-[#635bff] group-hover:text-white text-[#0a2540] px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                                            Iniciar Visita <ChevronRight size={18} />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {history.length === 0 ? (
                                <div className="stripe-card p-20 text-center flex flex-col items-center">
                                    <History className="text-[#e3e8ee] mb-4" size={48} />
                                    <p className="text-[#697386] font-bold text-sm">No hay historial reciente.</p>
                                </div>
                            ) : (
                                history.map((job) => (
                                    <div key={job._id} className="stripe-card p-5 flex items-center justify-between opacity-80">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#0a2540] text-sm uppercase">{job.clientId?.companyName}</h4>
                                                <p className="text-[10px] text-[#697386] font-bold">
                                                    FINALIZADO: {new Date(job.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold">COMPLETADO</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Visita */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-[#0a2540]/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="bg-white w-full max-w-3xl h-full md:h-auto md:max-h-[95vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-[#e3e8ee] flex justify-between items-start bg-[#f6f9fc]">
                                <div className="space-y-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusInfo(selectedJob.status).color}`}>
                                        {getStatusInfo(selectedJob.status).label}
                                    </span>
                                    <h2 className="text-xl font-bold text-[#0a2540]">{selectedJob.clientId?.companyName}</h2>
                                    <p className="text-sm text-[#697386] font-medium flex items-center gap-2">
                                        <MapPin size={14} /> {selectedJob.clientId?.address}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-white rounded-xl transition-all text-[#697386] shadow-sm border border-[#e3e8ee]">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Action Buttons Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.clientId?.address)}`}
                                        target="_blank" rel="noreferrer"
                                        className="stripe-card p-5 flex items-center gap-4 bg-[#0a2540] text-white border-none group"
                                    >
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Ver Mapa</p>
                                            <p className="font-bold text-sm">Abrir Navegador</p>
                                        </div>
                                    </a>
                                    <a 
                                        href={`tel:${selectedJob.clientId?.phone}`}
                                        className="stripe-card p-5 flex items-center gap-4 hover:border-[#635bff] group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-[#697386] tracking-wider">Llamar Cliente</p>
                                            <p className="font-bold text-sm text-[#0a2540]">{selectedJob.clientId?.phone || 'Sin teléfono'}</p>
                                        </div>
                                    </a>
                                </div>

                                {/* Extra Services Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-[#697386] uppercase tracking-wider flex items-center gap-2">
                                            <Plus size={16} /> ¿Has realizado algún extra?
                                        </h3>
                                        <span className="text-[9px] font-bold text-[#635bff] bg-indigo-50 px-2 py-0.5 rounded-full">OPCIONAL</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <input 
                                            className="sm:col-span-7 bg-[#f6f9fc] border border-[#e3e8ee] p-3 rounded-xl outline-none focus:border-[#635bff] text-sm font-semibold"
                                            placeholder="Descripción del extra..."
                                            value={newExtra.description}
                                            onChange={(e) => setNewExtra({...newExtra, description: e.target.value})}
                                        />
                                        <input 
                                            type="number"
                                            className="sm:col-span-3 bg-[#f6f9fc] border border-[#e3e8ee] p-3 rounded-xl outline-none focus:border-[#635bff] text-sm font-bold"
                                            placeholder="Precio €"
                                            value={newExtra.price}
                                            onChange={(e) => setNewExtra({...newExtra, price: e.target.value})}
                                        />
                                        <button 
                                            className="sm:col-span-2 bg-[#635bff] text-white rounded-xl flex items-center justify-center hover:bg-[#0a2540] transition-all py-3 shadow-lg shadow-indigo-100"
                                            onClick={() => {
                                                if(newExtra.description && newExtra.price) {
                                                    setCurrentExtras([...currentExtras, { ...newExtra, price: parseFloat(newExtra.price) }]);
                                                    setNewExtra({ description: '', price: '' });
                                                }
                                            }}
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    {currentExtras.length > 0 && (
                                        <div className="space-y-2">
                                            {currentExtras.map((ex, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-[#fcfdfe] p-3 rounded-xl border border-[#e3e8ee]">
                                                    <div className="flex items-center gap-3">
                                                       <span className="text-[#0a2540] font-bold text-xs uppercase">{ex.description}</span>
                                                       <span className="text-[#635bff] font-bold text-xs">{ex.price}€</span>
                                                    </div>
                                                    <button onClick={() => setCurrentExtras(currentExtras.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Signature Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-[#697386] uppercase tracking-wider flex items-center gap-2">
                                        <PenTool size={16} /> Firma del Cliente
                                    </h3>
                                    <div className="relative bg-[#f6f9fc] border-2 border-dashed border-[#e3e8ee] rounded-2xl overflow-hidden shadow-inner group">
                                        <SignatureCanvas 
                                            ref={sigPad}
                                            penColor='#0a2540'
                                            canvasProps={{ className: 'w-full h-48 md:h-64 cursor-crosshair' }}
                                        />
                                        <button 
                                            onClick={clearSignature}
                                            className="absolute top-4 right-4 p-2.5 bg-white text-[#697386] hover:text-rose-600 rounded-xl shadow-lg border border-[#e3e8ee] transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className="text-center text-[10px] text-[#697386] font-medium leading-relaxed max-w-sm mx-auto italic">
                                        "Al firmar, se confirma la realización del servicio y cualquier trabajo extra reportado."
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-[#f6f9fc] border-t border-[#e3e8ee] flex flex-col-reverse sm:flex-row gap-4">
                                <button onClick={() => setSelectedJob(null)} className="flex-1 py-4 font-bold text-[#697386] hover:bg-white rounded-xl transition-all text-sm uppercase tracking-widest">Cerrar</button>
                                <button 
                                    onClick={handleComplete}
                                    className="flex-[2] bg-[#635bff] text-white py-4 rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-[#0a2540] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                >
                                    <CheckCircle size={18} /> 
                                    {(selectedJob.visitsDone || 0) + 1 >= (selectedJob.expectedVisits || 1) ? 'Finalizar Servicio' : `Reportar Visita ${(selectedJob.visitsDone || 0) + 1}`}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default MyRoutes;
