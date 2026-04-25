import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, X, ChevronRight, Building, AlertTriangle, User, Zap, ChevronLeft, RefreshCcw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('expired') === '1') {
            setSessionExpired(true);
            window.history.replaceState({}, document.title, '/login');
        }
    }, []);
    
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryCompanyName, setRecoveryCompanyName] = useState('');
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryStatus, setRecoveryStatus] = useState(null);
    const [recoveryStep, setRecoveryStep] = useState(1);
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setRecoveryLoading(true);
        setRecoveryStatus(null);
        try {
            const API_URL = 'https://glassy.es/api';
            if (recoveryStep === 1) {
                await axios.post(`${API_URL}/auth/forgot-password`, { 
                    email: recoveryEmail, 
                    companyName: recoveryCompanyName 
                });
                setRecoveryStatus({ type: 'success', text: 'Código enviado.' });
                setRecoveryStep(2);
            } else {
                await axios.post(`${API_URL}/auth/reset-password`, { 
                    email: recoveryEmail, 
                    companyName: recoveryCompanyName,
                    otp: recoveryCode,
                    password: newPassword
                });
                setRecoveryStatus({ type: 'success', text: 'Contraseña actualizada.' });
                setTimeout(() => {
                    setShowForgotModal(false);
                    setRecoveryStep(1);
                }, 2000);
            }
        } catch (err) {
            setRecoveryStatus({ 
                type: 'error', 
                text: err.response?.data?.message || 'Error en la solicitud.' 
            });
        } finally {
            setRecoveryLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('https://glassy.es/api/auth/login', formData);
            if (response.data.token) {
                localStorage.setItem('glassy_user', JSON.stringify({
                    token: response.data.token,
                    username: response.data.username,
                    role: response.data.role,
                    tenantId: response.data.tenantId,
                    companyName: response.data.companyName || 'Mi Empresa',
                    plan: response.data.plan || 'starter',
                    planId: response.data.planId || response.data.plan || 'starter',
                    planActivo: response.data.planActivo,
                    trialDaysLeft: response.data.trialDaysLeft,
                    userId: response.data.userId,
                    fullName: response.data.fullName || response.data.username
                }));

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
        <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-['Figtree'] selection:bg-indigo-100 selection:text-indigo-900">
            {/* ─── Background Decorations ─── */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] relative z-10"
            >
                <div className="bg-white p-10 sm:p-14 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#e3e8ee]">
                    <div className="flex flex-col items-center mb-12">
                        <Link to="/" className="mb-8">
                            <div className="w-14 h-14 bg-[#635bff] rounded-[20px] flex items-center justify-center shadow-xl shadow-indigo-500/20 transform transition-all hover:scale-110 active:scale-95 group">
                                <span className="text-white font-bold text-3xl tracking-tighter group-hover:rotate-12 transition-transform">G</span>
                            </div>
                        </Link>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Bienvenido de nuevo</h1>
                        <p className="text-[#697386] text-sm mt-3 font-medium text-center">Accede al panel de control de tu empresa</p>
                    </div>

                    <AnimatePresence mode='wait'>
                        {sessionExpired && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-800 font-bold leading-tight uppercase tracking-wider">Tu sesión ha expirado</p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                                    <AlertTriangle size={20} />
                                </div>
                                <p className="text-xs text-rose-800 font-bold">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-[0.2em] ml-1">Identificador de Usuario</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#aab7c4] group-focus-within:text-[#635bff] transition-colors">
                                    <User size={20} />
                                </div>
                                <input 
                                    type="text" name="username" placeholder="usuario_admin" required
                                    className="w-full pl-14 pr-6 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-[20px] outline-none focus:border-[#635bff] focus:bg-white transition-all font-bold text-[#0a2540] placeholder:text-[#aab7c4] placeholder:font-medium"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-[#697386] uppercase tracking-[0.2em]">Contraseña Secreta</label>
                                <button 
                                    type="button" onClick={() => setShowForgotModal(true)}
                                    className="text-[10px] font-bold text-[#635bff] hover:text-[#0a2540] transition-colors uppercase tracking-widest"
                                >
                                    ¿Olvidaste la clave?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#aab7c4] group-focus-within:text-[#635bff] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input 
                                    type="password" name="password" placeholder="••••••••" required
                                    className="w-full pl-14 pr-6 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-[20px] outline-none focus:border-[#635bff] focus:bg-white transition-all font-bold text-[#0a2540]"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-[#635bff] text-white py-5 rounded-[22px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#0a2540] transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 active:scale-[0.98] mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCcw size={18} className="animate-spin" />
                                    <span>Verificando...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Entrar al Dashboard</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-[#f6f9fc] flex flex-col items-center gap-4">
                        <p className="text-sm text-[#697386] font-medium">
                            ¿Aún no eres cliente? <Link to="/register" className="text-[#635bff] font-bold hover:underline">Crea tu empresa ahora</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Link to="/" className="text-xs text-[#aab7c4] font-bold hover:text-[#635bff] transition-colors inline-flex items-center gap-2 uppercase tracking-widest">
                        <ChevronLeft size={16} /> Volver a la página principal
                    </Link>
                </div>
            </motion.div>

            {/* Recovery Modal */}
            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a2540]/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 relative"
                        >
                            <button 
                                onClick={() => setShowForgotModal(false)}
                                className="absolute top-8 right-8 p-2 rounded-xl hover:bg-[#f6f9fc] transition-colors text-[#aab7c4] hover:text-[#0a2540]"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center mb-10">
                                <div className="w-16 h-16 bg-indigo-50 text-[#635bff] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-[#0a2540] tracking-tight">Recuperar acceso</h2>
                                <p className="text-sm text-[#697386] mt-3 font-medium text-center leading-relaxed px-4">Introduce tus datos para que podamos validar tu identidad y enviar un código OTP.</p>
                            </div>

                            {recoveryStatus && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${recoveryStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {recoveryStatus.type === 'success' ? <Zap size={18} /> : <AlertTriangle size={18} />}
                                    {recoveryStatus.text}
                                </motion.div>
                            )}

                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                {recoveryStep === 1 ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Nombre Comercial</label>
                                            <input 
                                                type="text" placeholder="Ej: Glassy S.L." required
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]"
                                                onChange={(e) => setRecoveryCompanyName(e.target.value)}
                                                value={recoveryCompanyName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Email de Registro</label>
                                            <input 
                                                type="email" placeholder="admin@empresa.com" required
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]"
                                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                                value={recoveryEmail}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2 text-center">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest mb-3 block">Introduce el código OTP</label>
                                            <input 
                                                type="text" placeholder="000000" required
                                                maxLength={6}
                                                className="w-full px-4 py-5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-[24px] outline-none focus:border-[#635bff] font-black text-3xl tracking-[0.4em] text-center text-[#0a2540]"
                                                onChange={(e) => setRecoveryCode(e.target.value)}
                                                value={recoveryCode}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Nueva Clave de Acceso</label>
                                            <input 
                                                type="password" placeholder="••••••••" required
                                                className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] font-bold"
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                value={newPassword}
                                            />
                                        </div>
                                    </>
                                )}

                                <button 
                                    disabled={recoveryLoading}
                                    className="w-full bg-[#0a2540] text-white py-4.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#635bff] transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                                >
                                    {recoveryLoading ? <RefreshCcw className="animate-spin" size={18} /> : (recoveryStep === 1 ? 'Enviar código de seguridad' : 'Restablecer mi contraseña')}
                                    {!recoveryLoading && <ChevronRight size={18} />}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;
