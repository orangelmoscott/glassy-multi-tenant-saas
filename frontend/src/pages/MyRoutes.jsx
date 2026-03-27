import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Calendar, MapPin, Phone, Info, CheckCircle, 
  X, PenTool, Save, Trash2, ChevronRight, Clock, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const MyRoutes = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isSigning, setIsSigning] = useState(false);
    const [currentExtras, setCurrentExtras] = useState([]); // List of newly added extras for THIS visit
    const [newExtra, setNewExtra] = useState({ description: '', price: '' });
    const sigPad = useRef({});

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchMyAssignments();
    }, []);

    const fetchMyAssignments = async () => {
        try {
            const res = await axios.get('https://glassy-backend.onrender.com/assignments/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
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
                          text: `${(a.visitsDone || 0) + 1}/${a.expectedVisits || 1} este mes`
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
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200">
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

                {/* Mobile Friendly Header */}
                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                                <Calendar className="text-blue-400" size={24} /> Mi Ruta Actual
                            </h1>
                            <p className="text-slate-400 mt-1 font-medium text-sm">Pendientes para hoy: <span className="text-white font-bold">{assignments.length}</span> servicios.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                            <Clock className="text-blue-400" size={20} />
                            <span className="font-bold text-sm">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                        </div>
                    </div>
                </div>

                {/* Assignment List */}
                <div className="space-y-4">
                    {loading ? (
                        [1,2].map(i => <div key={i} className="h-28 bg-slate-50 border border-slate-100 rounded-[35px] animate-pulse"></div>)
                    ) : (
                        assignments.map(job => (
                            <motion.div 
                                key={job._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] relative overflow-hidden"
                                onClick={() => {
                                    setSelectedJob(job);
                                    setCurrentExtras([]);
                                }}
                            >
                                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.clientId?.companyName}</h3>
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1.5">
                                            {job.progressInfo && (
                                                <span className="text-[10px] font-black w-fit px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100 flex items-center gap-1.5">
                                                    <RefreshCcw size={10}/> {job.progressInfo.text}
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.1em] border ${getStatusInfo(job.status).color}`}>
                                                {getStatusInfo(job.status).label}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400 truncate max-w-[200px] flex items-center gap-1">
                                                <MapPin size={10} /> {job.clientId?.address}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight size={18} />
                                </div>
                            </motion.div>
                        ))
                    )}
                    {assignments.length === 0 && !loading && (
                        <div className="p-20 text-center bg-white rounded-[50px] border-2 border-dashed border-slate-100">
                             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                <CheckCircle size={40} />
                             </div>
                             <h3 className="text-xl font-bold text-slate-800">¡Ruta finalizada!</h3>
                             <p className="text-slate-400 font-medium mt-2">No tienes servicios pendientes para gestionar.</p>
                        </div>
                    )}
                </div>
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
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusInfo(selectedJob.status).color}`}>
                                            {getStatusInfo(selectedJob.status).label}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">{selectedJob.clientId?.companyName}</h2>
                                    <p className="text-slate-500 text-sm font-bold flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {selectedJob.clientId?.address}</p>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="p-4 bg-white text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>

                             {/* Job Details */}
                             <div className="p-10 space-y-10 flex-1 overflow-y-auto">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex items-center justify-between col-span-1 md:col-span-2 shadow-xl">
                                           <div>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-70">Ubicación Navegación</p>
                                              <p className="text-lg font-bold truncate max-w-[300px]">{selectedJob.clientId?.address}</p>
                                           </div>
                                           <a 
                                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.clientId?.address)}`}
                                              target="_blank" rel="noreferrer"
                                              className="w-14 h-14 bg-blue-600 text-white hover:bg-blue-400 rounded-2xl flex items-center justify-center transition-all shadow-lg"
                                           ><MapPin size={24}/></a>
                                       </div>

                                       <a href={`tel:${selectedJob.clientId?.phone}`} className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-5 hover:bg-blue-100 transition-all group">
                                           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><Phone size={24} /></div>
                                           <div>
                                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Contactar Ahora</p>
                                              <p className="text-lg font-black text-blue-800">{selectedJob.clientId?.phone || 'Sin teléfono'}</p>
                                           </div>
                                       </a>

                                       <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Clock size={24} /></div>
                                            <div>
                                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 font-sans">Meta Mensual</p>
                                               <p className="text-lg font-black text-slate-800">{selectedJob.visitsDone || 0} de {selectedJob.expectedVisits || 1} Visitas</p>
                                            </div>
                                       </div>
                                  </div>

                                  {/* TRABAJOS EXTRA - REQUERIMIENTO USER */}
                                  <div className="p-8 bg-blue-50/30 rounded-[40px] border-2 border-dashed border-blue-200/50 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                                                <Plus size={18} /> ¿Has realizado un trabajo extra hoy?
                                            </h3>
                                            <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Opcional</span>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <input 
                                                className="flex-[2] bg-white border border-blue-100 p-4 rounded-2xl outline-none focus:border-blue-600 text-sm font-bold shadow-sm"
                                                placeholder="Ej: Limpieza de rótulos o marcos..."
                                                value={newExtra.description}
                                                onChange={(e) => setNewExtra({...newExtra, description: e.target.value})}
                                            />
                                            <input 
                                                type="number"
                                                className="flex-1 bg-white border border-blue-100 p-4 rounded-2xl outline-none focus:border-blue-600 text-sm font-bold shadow-sm"
                                                placeholder="Precio €"
                                                value={newExtra.price}
                                                onChange={(e) => setNewExtra({...newExtra, price: e.target.value})}
                                            />
                                            <button 
                                                type="button" 
                                                className="px-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-90"
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
                                            <div className="space-y-2 pt-2">
                                                {currentExtras.map((ex, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-blue-100/50 p-4 rounded-2xl border border-blue-200">
                                                        <span className="font-bold text-blue-900 flex items-center gap-2 text-sm"><CheckCircle size={14}/> {ex.description}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-blue-900">+{ex.price}€</span>
                                                            <button onClick={() => setCurrentExtras(currentExtras.filter((_, i) => i !== idx))}><Trash2 size={16} className="text-red-400 hover:text-red-500"/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="text-right pr-2">
                                                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-2">Total Extra para Facturar: +{currentExtras.reduce((s, c) => s + c.price, 0).toFixed(2)}€</p>
                                                </div>
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
                                     <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-3 overflow-hidden relative group shadow-inner">
                                          <SignatureCanvas 
                                             ref={sigPad}
                                             penColor='#111827'
                                             canvasProps={{ className: 'w-full h-80 cursor-crosshair bg-white rounded-[35px] shadow-sm' }}
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
                             <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-6">
                                 <button onClick={() => setSelectedJob(null)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-xs">Posponer</button>
                                 <button 
                                     onClick={handleComplete}
                                     className="flex-[3] bg-slate-900 text-white py-6 rounded-[25px] font-black shadow-2xl shadow-slate-200 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                                 >
                                     <CheckCircle size={24} className="text-blue-400" /> 
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

export default MyRoutes;tes;
