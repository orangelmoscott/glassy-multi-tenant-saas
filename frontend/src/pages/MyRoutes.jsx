import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Calendar, MapPin, Phone, Info, CheckCircle, 
  X, PenTool, Save, Trash2, ChevronRight, Clock, FileText,
  RefreshCcw, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

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
            const res = await axios.get('https://glassy-backend.onrender.com/assignments/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setAssignments(data);
            
            // Lógica inteligente para seleccionar el día inicial
            if (data.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const datesWithWork = [...new Set(data.map(a => new Date(a.date).toISOString().split('T')[0]))].sort();
                
                if (datesWithWork.includes(today)) {
                    setSelectedDate(today);
                } else if (datesWithWork.length > 0) {
                    setSelectedDate(datesWithWork[0]); // Seleccionar el día más próximo si no hay nada hoy
                }
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Obtener días únicos que tienen asignaciones
    const uniqueDates = [...new Set(assignments.map(a => new Date(a.date).toISOString().split('T')[0]))].sort();
    
    // Filtrar asignaciones por fecha seleccionada
    const filteredAssignments = assignments.filter(a => new Date(a.date).toISOString().split('T')[0] === selectedDate);

    const fetchMyHistory = async () => {
        try {
            const res = await axios.get('https://glassy-backend.onrender.com/assignments/my-history', {
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

            await axios.patch(`https://glassy-backend.onrender.com/assignments/${selectedJob._id}/complete`, body, {
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
            alert(isLastVisit ? 'Servicio completado' : 'Visita Registrada exitosamente');
        } catch (err) {
            alert('Error al validar el servicio.');
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completado': return { label: 'Finalizado', color: 'bg-green-100 text-green-600 border-green-200' };
            case 'en_ruta': return { label: 'En Ruta', color: 'bg-blue-100 text-blue-600 border-blue-200' };
            default: return { label: 'Pendiente', color: 'bg-amber-100 text-amber-600 border-amber-200' };
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 pb-10 px-4 pt-10">
                {/* Perfil del Operario */}
                <div className="bg-white p-6 md:p-8 rounded-[30px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{user.fullName || user.username}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                                <span className="text-slate-400 font-bold text-sm tracking-tight">{user.companyName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SELECTOR DE FECHA HORIZONTAL (Premium mobile-first) */}
                {activeTab === 'pendientes' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mi Calendario de Rutas</p>
                             <div className="h-1 flex-1 mx-4 bg-slate-100 rounded-full opacity-50"></div>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-4 px-1 no-scrollbar lg:justify-start">
                            <style>{`
                                .no-scrollbar::-webkit-scrollbar { display: none; }
                                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                            `}</style>
                            {uniqueDates.length === 0 ? (
                                <div className="text-slate-400 text-xs font-bold py-2">No hay rutas programadas</div>
                            ) : (
                                uniqueDates.map(dateStr => (
                                    <button
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`flex flex-col items-center min-w-[90px] md:min-w-[110px] p-4 rounded-3xl transition-all duration-300 border-2 ${
                                            selectedDate === dateStr 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105' 
                                            : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100'
                                        }`}
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedDate === dateStr ? 'text-blue-400' : 'text-slate-400'}`}>
                                            {new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}
                                        </span>
                                        <span className="text-lg font-black">{new Date(dateStr + 'T12:00:00').getDate()}</span>
                                        <span className="text-[9px] font-bold uppercase">{new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' })}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Selector */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit mx-auto md:mx-0">
                    <button 
                        onClick={() => setActiveTab('pendientes')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pendientes' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Pendientes
                    </button>
                    <button 
                        onClick={() => setActiveTab('historial')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'historial' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Historial
                    </button>
                </div>

                {activeTab === 'pendientes' ? (
                    <div className="space-y-6">
                        {loading ? (
                            [1,2].map(i => <div key={i} className="h-28 bg-slate-50 border border-slate-100 rounded-[35px] animate-pulse"></div>)
                        ) : filteredAssignments.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-slate-200">
                                <CheckCircle className="mx-auto text-emerald-100 mb-4" size={64} />
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">Libre por hoy</h3>
                                <p className="text-slate-400 font-medium mt-2">No tienes servicios asignados para este día.</p>
                            </div>
                        ) : (
                            filteredAssignments.map((job) => (
                                <motion.div 
                                    key={job._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative group hover:border-blue-200 transition-all cursor-pointer"
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusInfo(job.status).color}`}>
                                                        {getStatusInfo(job.status).label}
                                                    </span>
                                                    {job.progressInfo && (
                                                        <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {job.progressInfo.text}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{job.clientId?.companyName}</h3>
                                                    {job.expectedVisits > 1 && (
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="flex-1 h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-blue-500 rounded-full shadow-sm shadow-blue-200" 
                                                                    style={{ width: `${Math.min(((job.visitsDone || 0) / (job.expectedVisits || 1)) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-400">Progreso Total</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                                        <MapPin size={16} className="text-blue-500" />
                                                        {job.clientId?.address}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:items-end justify-center">
                                                <div className="bg-blue-600 text-white px-8 py-4 rounded-[20px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
                                                    Gestionar Visita <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-slate-200">
                                <Clock className="mx-auto text-slate-100 mb-4" size={64} />
                                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No hay historial reciente.</p>
                            </div>
                        ) : (
                            history.map((job) => (
                                <motion.div 
                                    key={job._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white/60 p-6 rounded-[30px] border border-slate-100 flex items-center justify-between opacity-80"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">{job.clientId?.companyName}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                Finalizado el {new Date(job.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">{job.price?.toFixed(2)}€</p>
                                        {job.extraServices?.length > 0 && (
                                            <p className="text-[9px] text-emerald-600 font-bold">+{job.extraServices.reduce((s, e) => s + e.price, 0).toFixed(2)}€ Extras</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Signature & Detail Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl md:p-10 flex items-center justify-center">
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white w-full h-full md:h-auto md:max-w-3xl md:rounded-[50px] overflow-hidden flex flex-col shadow-3xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4 relative">
                                <div className="space-y-1 pr-10 md:pr-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusInfo(selectedJob.status).color}`}>
                                            {getStatusInfo(selectedJob.status).label}
                                        </span>
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase break-words">{selectedJob.clientId?.companyName}</h2>
                                    <p className="text-slate-500 text-sm font-bold flex items-start md:items-center gap-2"><MapPin size={18} className="text-blue-500 shrink-0 mt-0.5 md:mt-0" /> {selectedJob.clientId?.address}</p>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 md:relative md:top-auto md:right-auto p-3 md:p-4 bg-white text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>

                             {/* Job Details */}
                             <div className="p-6 md:p-10 space-y-8 md:space-y-10 flex-1 overflow-y-auto">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                       <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex items-center justify-between col-span-1 md:col-span-2 shadow-xl gap-4">
                                           <div className="overflow-hidden">
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-70">Ubicación Navegación</p>
                                              <p className="text-base md:text-lg font-bold truncate w-full">{selectedJob.clientId?.address}</p>
                                           </div>
                                           <a 
                                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.clientId?.address)}`}
                                              target="_blank" rel="noreferrer"
                                              className="w-14 h-14 bg-blue-600 text-white hover:bg-blue-400 rounded-2xl flex items-center justify-center transition-all shadow-lg"
                                           ><MapPin size={24}/></a>
                                       </div>

                                       <a href={`tel:${selectedJob.clientId?.phone}`} className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4 md:gap-5 hover:bg-blue-100 transition-all group overflow-hidden">
                                           <div className="w-12 h-12 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><Phone size={24} /></div>
                                           <div className="min-w-0">
                                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Contactar Ahora</p>
                                              <p className="text-lg font-black text-blue-800">{selectedJob.clientId?.phone || 'Sin teléfono'}</p>
                                           </div>
                                       </a>

                                       <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 md:gap-5 overflow-hidden">
                                            <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Clock size={24} /></div>
                                            <div className="min-w-0">
                                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 font-sans">Meta Mensual</p>
                                               <p className="text-lg font-black text-slate-800">{selectedJob.visitsDone || 0} de {selectedJob.expectedVisits || 1} Visitas</p>
                                            </div>
                                       </div>
                                  </div>

                                  {/* TRABAJOS EXTRA */}
                                  <div className="p-5 md:p-8 bg-blue-50/30 rounded-[30px] md:rounded-[40px] border-2 border-dashed border-blue-200/50 space-y-4 md:space-y-6">
                                        <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row">
                                            <h3 className="text-xs md:text-sm font-black text-blue-800 uppercase tracking-widest flex items-center gap-2 leading-snug">
                                                <Plus size={18} className="shrink-0" /> ¿Has realizado un trabajo extra hoy?
                                            </h3>
                                            <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase self-start md:self-auto">Opcional</span>
                                        </div>
                                        
                                        <div className="flex flex-col xl:flex-row gap-3">
                                            <input 
                                                className="flex-[2] bg-white border border-blue-100 p-4 rounded-2xl outline-none focus:border-blue-600 text-sm font-bold shadow-sm w-full"
                                                placeholder="Ej: Limpieza rótulos..."
                                                value={newExtra.description}
                                                onChange={(e) => setNewExtra({...newExtra, description: e.target.value})}
                                            />
                                            <div className="flex gap-3">
                                                <input 
                                                    type="number"
                                                    className="flex-[1] bg-white border border-blue-100 p-4 rounded-2xl outline-none focus:border-blue-600 text-sm font-bold shadow-sm w-full min-w-[100px]"
                                                    placeholder="Precio €"
                                                    value={newExtra.price}
                                                    onChange={(e) => setNewExtra({...newExtra, price: e.target.value})}
                                                />
                                                <button 
                                                    type="button" 
                                                    className="px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-90 flex items-center justify-center"
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
                                        </div>

                                        {currentExtras.length > 0 && (
                                            <div className="space-y-2 pt-2">
                                                {currentExtras.map((ex, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-blue-100/50 p-4 rounded-2xl border border-blue-200">
                                                        <div className="flex items-center gap-3">
                                                           <span className="text-blue-800 font-bold text-xs uppercase">{ex.description}</span>
                                                           <span className="text-blue-500 font-black text-xs">{ex.price}€</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => setCurrentExtras(currentExtras.filter((_, i) => i !== idx))}
                                                            className="text-red-400 hover:text-red-600 transition-colors"
                                                        ><Trash2 size={16}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                  </div>

                                  {/* Admin/Client Notes */}
                                  {selectedJob.notes && (
                                      <div className="p-8 bg-amber-50 rounded-[35px] border border-amber-100 space-y-3 relative overflow-hidden">
                                          <div className="absolute top-0 right-0 p-4 opacity-5"><FileText size={40} /></div>
                                          <div className="flex items-center gap-2 text-amber-600">
                                              <Info size={18} />
                                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Instrucciones del Administrador</span>
                                          </div>
                                          <p className="text-base font-bold text-amber-900 leading-relaxed italic">
                                             "{selectedJob.notes}"
                                          </p>
                                      </div>
                                  )}

                                  {/* Signature Section ALWAYS VISIBLE */}
                                 <div className="space-y-6 pt-4">
                                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                         <PenTool size={20} className="text-blue-600" /> Firma de Validación del Cliente
                                     </h3>
                                     <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[30px] md:rounded-[40px] p-2 md:p-3 overflow-hidden relative group shadow-inner">
                                          <SignatureCanvas 
                                             ref={sigPad}
                                             penColor='#111827'
                                             canvasProps={{ className: 'w-full h-48 md:h-80 cursor-crosshair bg-white rounded-[25px] md:rounded-[35px] shadow-sm' }}
                                          />
                                          <button 
                                             onClick={clearSignature}
                                             className="absolute top-6 right-6 bg-red-100/80 backdrop-blur p-4 rounded-2xl text-red-600 border border-red-50 shadow-md hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                          >
                                              <Trash2 size={24} />
                                          </button>
                                     </div>
                                     <p className="text-center text-xs font-bold text-slate-400 leading-relaxed max-w-md mx-auto italic px-6">
                                        "Al firmar, el cliente confirma que el servicio de cristales básico {currentExtras.length > 0 ? 'y los trabajos extras reportados' : ''} se han realizado correctamente."
                                     </p>
                                 </div>
                             </div>

                             {/* Action Footer */}
                             <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 flex flex-col-reverse md:flex-row gap-4 md:gap-6">
                                 <button onClick={() => setSelectedJob(null)} className="w-full md:flex-1 py-4 md:py-5 font-black text-slate-400 hover:bg-slate-200/50 rounded-2xl md:bg-transparent transition-all uppercase tracking-widest text-xs">Posponer</button>
                                 <button 
                                     onClick={handleComplete}
                                     className="w-full md:flex-[3] bg-slate-900 text-white py-4 md:py-6 px-4 rounded-[20px] md:rounded-[25px] font-black shadow-2xl shadow-slate-200 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 text-xs md:text-lg text-center leading-tight"
                                 >
                                     <CheckCircle size={20} className="text-blue-400 shrink-0 md:w-6 md:h-6" /> 
                                     {(selectedJob.visitsDone || 0) + 1 >= (selectedJob.expectedVisits || 1) ? 'FINALIZAR SERVICIO COMPLETO' : `REPORTAR VISITA ${(selectedJob.visitsDone || 0) + 1}/${selectedJob.expectedVisits || 1}`}
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
