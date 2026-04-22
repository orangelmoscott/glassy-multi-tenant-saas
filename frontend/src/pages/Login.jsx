import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, X, ChevronRight, Building, AlertTriangle } from 'lucide-react';
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
        <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-[0_15px_35px_rgba(50,50,93,0.1),0_5px_15px_rgba(0,0,0,0.07)] border border-[#e3e8ee]">
                    <div className="flex flex-col items-center mb-10">
                        <Link to="/" className="mb-6">
                            <div className="w-12 h-12 bg-[#635bff] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transform transition hover:scale-105 active:scale-95">
                                <span className="text-white font-bold text-2xl tracking-tighter">G</span>
                            </div>
                        </Link>
                        <h1 className="text-2xl font-bold text-[#0a2540] tracking-tight">Accede a tu cuenta</h1>
                        <p className="text-[#697386] text-sm mt-2 font-medium">Gestión profesional de limpieza de cristales</p>
                    </div>

                    {sessionExpired && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <p className="text-xs text-amber-800 font-semibold leading-tight">Sesión expirada. Por favor, identifícate de nuevo.</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-rose-500" />
                            <p className="text-xs text-rose-800 font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Usuario</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-[#aab7c4]" size={18} />
                                <input 
                                    type="text" name="username" placeholder="Tu usuario" required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] focus:shadow-[0_0_0_1px_#635bff] transition-all font-semibold text-[#0a2540]"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-[#697386] uppercase tracking-wider">Contraseña</label>
                                <button 
                                    type="button" onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-bold text-[#635bff] hover:text-[#0a2540] transition-colors"
                                >
                                    ¿Olvidaste la clave?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-[#aab7c4]" size={18} />
                                <input 
                                    type="password" name="password" placeholder="••••••••" required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] focus:shadow-[0_0_0_1px_#635bff] transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-[#635bff] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0a2540] transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-[#f6f9fc] flex flex-col items-center gap-4">
                        <p className="text-sm text-[#697386] font-medium">
                            ¿Aún no tienes cuenta? <Link to="/register" className="text-[#635bff] font-bold hover:underline">Regístrate</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-sm text-[#697386] font-bold hover:text-[#0a2540] transition-colors inline-flex items-center gap-2">
                        ← Volver a la página principal
                    </Link>
                </div>
            </motion.div>

            {/* Recovery Modal */}
            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative"
                        >
                            <button 
                                onClick={() => setShowForgotModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-lg hover:bg-[#f6f9fc] transition-colors"
                            >
                                <X size={20} className="text-[#697386]" />
                            </button>

                            <div className="flex flex-col items-center mb-8">
                                <div className="w-12 h-12 bg-indigo-50 text-[#635bff] rounded-xl flex items-center justify-center mb-4">
                                    <ShieldCheck size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-[#0a2540]">Recuperar acceso</h2>
                                <p className="text-sm text-[#697386] mt-2 font-medium text-center">Te enviaremos un código de seguridad para restablecer tu contraseña.</p>
                            </div>

                            {recoveryStatus && (
                                <div className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${recoveryStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                    {recoveryStatus.type === 'success' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                                    {recoveryStatus.text}
                                </div>
                            )}

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                {recoveryStep === 1 ? (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider">Nombre de Empresa</label>
                                            <input 
                                                type="text" placeholder="Ej: Glassy S.L." required
                                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                                onChange={(e) => setRecoveryCompanyName(e.target.value)}
                                                value={recoveryCompanyName}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider">Email registrado</label>
                                            <input 
                                                type="email" placeholder="admin@empresa.com" required
                                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                                value={recoveryEmail}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider">Código (OTP)</label>
                                            <input 
                                                type="text" placeholder="123456" required
                                                maxLength={6}
                                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-black text-xl tracking-[0.5em] text-center"
                                                onChange={(e) => setRecoveryCode(e.target.value)}
                                                value={recoveryCode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider">Nueva clave</label>
                                            <input 
                                                type="password" placeholder="••••••••" required
                                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff]"
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                value={newPassword}
                                            />
                                        </div>
                                    </>
                                )}

                                <button 
                                    disabled={recoveryLoading}
                                    className="w-full bg-[#0a2540] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#635bff] transition-all disabled:opacity-50"
                                >
                                    {recoveryLoading ? 'Cargando...' : (recoveryStep === 1 ? 'Enviar código' : 'Cambiar contraseña')}
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
