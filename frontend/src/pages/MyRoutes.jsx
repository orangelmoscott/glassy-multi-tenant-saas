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
            await axios.patch(`https://glassy-backend.onrender.com/assignments/${selectedJob._id}/complete`, {
                signature: signatureBase64,
                notes: isLastVisit ? 'Trabajo mensual finalizado y validado.' : 'Visita registrada con validación de firma.'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (isLastVisit) {
                setAssignments(assignments.filter(a => a._id !== selectedJob._id));
            } else {
                setAssignments(assignments.map(a => a._id === selectedJob._id ? {
                      ...a, 
                      visitsDone: (a.visitsDone || 0) + 1,
                      progressInfo: {
                          ...a.progressInfo,
                          text: `${(a.visitsDone || 0) + 1}/${a.expectedVisits || 1} este mes`
                      }
                  } : a));
            }
            
            setIsSigning(false);
            setSelectedJob(null);
            alert(isLastVisit ? 'Servicio completado' : 'Visita Registrada exitosamente');
        } catch (err) {
            alert('Error al validar el servicio.');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 pb-10">
                {/* Perfil del Operario */}
                <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl md:rounded-[25px] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{user.fullName || user.username}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">{user.role}</span>
                                <span className="text-slate-400 font-bold text-sm">{user.companyName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Friendly Header */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-[30px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                            <Calendar className="text-blue-400" size={24} /> Mi Ruta
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium text-sm">Pendientes: <span className="text-white font-bold">{assignments.length}</span> servicios.</p>
                    </div>
                </div>

                {/* Assignment List */}
                <div className="space-y-3 md:space-y-4">
                    {loading ? (
                        [1,2].map(i => <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse"></div>)
                    ) : (
                        assignments.map(job => (
                            <motion.div 
                                key={job._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98]"
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                        <MapPin size={22} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-slate-800 text-base md:text-lg truncate">{job.clientId?.companyName}</h3>
                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                                            {job.progressInfo && (
                                                <span className="text-[10px] font-black w-fit px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={10}/> {job.progressInfo.text}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><Clock size={10}/> Pendiente</span>
                                            <span className="text-xs font-bold text-slate-500 truncate max-w-[200px]">{job.clientId?.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all">
                                    <ChevronRight size={18} />
                                </div>
                            </motion.div>
                        ))
                    )}
                    {assignments.length === 0 && !loading && (
                        <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                             <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                             <p className="text-slate-400 font-bold">¡Ruta completada! No tienes más tareas hoy.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Signature & Detail Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-lg md:p-10 flex items-center justify-center">
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-[50px] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-800">{selectedJob.clientId?.companyName}</h2>
                                    <p className="text-slate-400 text-sm font-medium">{selectedJob.clientId?.address}</p>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                             {/* Job Details */}
                             <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between col-span-1 md:col-span-2">
                                          <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destino de la Ruta</p>
                                             <p className="text-xl font-black text-slate-900">{selectedJob.clientId?.companyName}</p>
                                          </div>
                                          <a 
                                             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.clientId?.address)}`}
                                             target="_blank" rel="noreferrer"
                                             className="w-10 h-10 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all"
                                          ><MapPin size={20}/></a>
                                      </div>

                                      {/* Contenedor de Extras */}
                                      {selectedJob.extraServices && selectedJob.extraServices.length > 0 && (
                                          <div className="col-span-1 md:col-span-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Servicios Extras Requeridos</p>
                                              {selectedJob.extraServices.map((extra, idx) => (
                                                  <div key={idx} className="flex justify-between items-center text-sm font-bold text-blue-900">
                                                      <span>+ {extra.description}</span>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                     <a href={`tel:${selectedJob.clientId?.phone}`} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                         <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Phone size={20} /></div>
                                         <div>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Llamar Cliente</p>
                                            <p className="text-sm font-bold text-blue-700">{selectedJob.clientId?.phone || 'Sin tel.'}</p>
                                         </div>
                                     </a>
                                 </div>

                                 {/* Admin/Client Notes */}
                                 {selectedJob.notes && (
                                     <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-2">
                                         <div className="flex items-center gap-2 text-amber-600 py-1">
                                             <FileText size={16} />
                                             <span className="text-[10px] font-black uppercase tracking-widest">Instrucciones Especiales</span>
                                         </div>
                                         <p className="text-sm font-medium text-amber-800 leading-relaxed italic">
                                            "{selectedJob.notes}"
                                         </p>
                                     </div>
                                 )}

                                 {/* Signature Section ALWAYS VISIBLE */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <PenTool size={16} /> Validación de Trabajo (Firma)
                                    </h3>
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[30px] p-2 overflow-hidden relative group">
                                         <SignatureCanvas 
                                            ref={sigPad}
                                            penColor='#2563eb'
                                            canvasProps={{ className: 'w-full h-64 cursor-crosshair bg-white rounded-[25px]' }}
                                         />
                                         <button 
                                            onClick={clearSignature}
                                            className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-lg text-red-500 border border-slate-100 shadow-sm"
                                         >
                                             <Trash2 size={16} />
                                         </button>
                                    </div>
                                    <p className="text-center text-[10px] text-slate-400 font-medium">Requerido en cada limpieza: Al firmar, el cliente valida el trabajo realizado.</p>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <button onClick={() => setSelectedJob(null)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600">Posponer</button>
                                <button 
                                    onClick={handleComplete}
                                    className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-extrabold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} /> {(selectedJob.visitsDone || 0) + 1 >= (selectedJob.expectedVisits || 1) ? 'Validar Fin de Mes' : `Registrar Visita (${(selectedJob.visitsDone || 0) + 1}/${selectedJob.expectedVisits || 1})`}
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
