import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, X, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal de recuperación
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryStatus, setRecoveryStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setRecoveryLoading(true);
        setRecoveryStatus(null);
        try {
            await axios.post('https://glassy-backend.onrender.com/auth/forgot-password', { email: recoveryEmail });
            setRecoveryStatus({ type: 'success', text: 'Instrucciones enviadas. Revisa tu correo.' });
        } catch (err) {
            setRecoveryStatus({ type: 'error', text: err.response?.data?.message || 'Error al procesar la solicitud' });
        } finally {
            setRecoveryLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('https://glassy-backend.onrender.com/auth/login', formData);
            if (response.data.token) {
                // Guardar sesión profesional
                localStorage.setItem('glassy_user', JSON.stringify({
                    token: response.data.token,
                    username: response.data.username,
                    role: response.data.role,
                    tenantId: response.data.tenantId,
                    companyName: response.data.companyName || 'Mi Empresa',
                    plan: response.data.plan || 'starter',
                    trialDaysLeft: response.data.trialDaysLeft,
                    userId: response.data.userId,
                    fullName: response.data.fullName || response.data.username
                }));

                // Redirigir según rol: cristaleros a sus rutas, admin/owner al panel
                if (response.data.role === 'cristalero') {
                    navigate('/app/my-routes');
                } else {
                    navigate('/app/clients');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
             {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400 rounded-full blur-[120px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-white p-10 py-12 rounded-[40px] shadow-2xl border border-white/20 backdrop-blur-3xl relative">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Link to="/" className="inline-block transform hover:scale-110 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                                <span className="text-white font-extrabold text-3xl">G</span>
                            </div>
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Acceso a tu Panel</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 opacity-70">SaaS Management Solution</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm mb-8 rounded-r-xl font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
                             <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                                <input 
                                    type="text" name="username" placeholder="tu_usuario" required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm font-medium"
                                    onChange={handleChange}
                                />
                             </div>
                        </div>

                        <div className="space-y-2">
                             <div className="flex justify-between items-center ml-1">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                                 <button 
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                 >
                                    ¿La olvidaste?
                                 </button>
                             </div>
                             <div className="relative group">
                                <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                                <input 
                                    type="password" name="password" placeholder="••••••••" required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                    onChange={handleChange}
                                />
                             </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button 
                                disabled={loading}
                                className={`w-full bg-slate-900 text-white py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                            >
                                {loading ? 'Validando...' : 'Entrar a mi Empresa'}
                                {!loading && <ArrowRight size={20} />}
                            </button>

                            <div className="text-center">
                                <p className="text-slate-500 text-sm">
                                    ¿Nuevo en Glassy? <a href="/register" className="text-blue-600 font-bold hover:underline">Registra tu empresa</a>
                                </p>
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">
                            <ShieldCheck size={14} className="text-blue-500"/>
                            Protocolo de Aislamiento Activo
                        </div>
                         <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={14} className="text-amber-500"/>
                            Plan Starter (7 Días de Prueba)
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all group">
                        <span className="transform transition-transform group-hover:-translate-x-1">←</span> Volver a Inicio
                    </a>
                </div>
            </motion.div>

            {/* Modal de Recuperación Profesional */}
            {showForgotModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white max-w-md w-full rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
                    >
                        <button 
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <div className="flex flex-col items-center mb-8 text-center">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recuperar acceso</h2>
                            <p className="text-slate-500 text-sm font-medium mt-2">Introduce el email de tu empresa</p>
                        </div>

                        {recoveryStatus && (
                            <div className={`p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 ${recoveryStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {recoveryStatus.type === 'success' && <ShieldCheck size={18} />}
                                {recoveryStatus.text}
                            </div>
                        )}

                        {recoveryStatus?.type !== 'success' ? (
                            <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Profesional</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                                    <input 
                                        type="email" placeholder="admin@empresa.com" required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        value={recoveryEmail}
                                    />
                                </div>
                            </div>

                            <button 
                                disabled={recoveryLoading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70"
                            >
                                {recoveryLoading ? 'Procesando...' : 'Enviar instrucciones'}
                                {!recoveryLoading && <ChevronRight size={20} />}
                            </button>
                        </form>
                        ) : (
                            <button 
                                onClick={() => {
                                    setShowForgotModal(false);
                                    setRecoveryStatus(null);
                                }}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-extrabold hover:bg-slate-800 transition-all"
                            >
                                Entendido
                            </button>
                        )}
                       
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Login;
