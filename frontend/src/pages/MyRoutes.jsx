import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Calendar, MapPin, Phone, Info, CheckCircle, 
  X, PenTool, Save, Trash2, ChevronRight, Clock
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

    const clearSignature = () => sigPad.current.clear();

    const handleComplete = async () => {
        if (sigPad.current.isEmpty()) {
            alert('Por favor, el cliente debe firmar para validar el servicio.');
            return;
        }

        const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        
        try {
            await axios.patch(`https://glassy-backend.onrender.com/assignments/${selectedJob._id}/complete`, {
                signature: signatureBase64,
                notes: 'Trabajo finalizado y validado por el cliente.'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setAssignments(assignments.filter(a => a._id !== selectedJob._id));
            setIsSigning(false);
            setSelectedJob(null);
        } catch (err) {
            alert('Error al validar el servicio.');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Mobile Friendly Header */}
                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold flex items-center gap-3">
                            <Calendar className="text-blue-400" /> Mi Ruta de Hoy
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Tienes <span className="text-white font-bold">{assignments.length}</span> servicios pendientes.</p>
                    </div>
                </div>

                {/* Assignment List */}
                <div className="space-y-4">
                    {loading ? (
                        [1,2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>)
                    ) : (
                        assignments.map(job => (
                            <motion.div 
                                key={job._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer"
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{job.clientId?.companyName}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><Clock size={12}/> Pendiente</span>
                                            <span className="text-xs font-bold text-blue-600">{job.clientId?.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all">
                                    <ChevronRight size={20} />
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
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precio Servicio</p>
                                         <p className="text-xl font-black text-slate-900">{selectedJob.price}€</p>
                                     </div>
                                     <a href={`tel:${selectedJob.clientId?.phone}`} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                         <Phone className="text-blue-600" />
                                         <div>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Llamar</p>
                                            <p className="text-sm font-bold text-blue-700">{selectedJob.clientId?.phone || 'Sin tel.'}</p>
                                         </div>
                                     </a>
                                </div>

                                {/* Signature Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <PenTool size={16} /> Firma del Cliente
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
                                    <p className="text-center text-[10px] text-slate-400 font-medium">Al firmar, el cliente valida la correcta limpieza de los cristales.</p>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <button onClick={() => setSelectedJob(null)} className="flex-1 py-4 font-bold text-slate-400">Posponer</button>
                                <button 
                                    onClick={handleComplete}
                                    className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-extrabold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> Validar Servicio
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
