import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                    plan: response.data.plan || 'starter'
                }));
                navigate('/app');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
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
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                            <span className="text-white font-extrabold text-3xl">G</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido a Glassy</h1>
                        <p className="text-slate-400 font-medium mt-2">Acceso seguro a tu panel SaaS</p>
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
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                    onChange={handleChange}
                                />
                             </div>
                        </div>

                        <div className="space-y-2">
                             <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">¿La olvidaste?</a>
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

                        <button 
                            disabled={loading}
                            className={`w-full bg-slate-900 text-white py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 transition-all mt-8 shadow-xl shadow-slate-200 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                        >
                            {loading ? 'Validando...' : 'Entrar a mi Empresa'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                            <ShieldCheck size={18} className="text-blue-500"/>
                            Aislamiento Multi-instancia Activo
                        </div>
                         <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                            <Sparkles size={18} className="text-amber-500"/>
                            Plan Starter (Gratis 14 días)
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    ¿Eres nuevo en la plataforma? <a href="/register" className="text-blue-600 font-bold hover:underline">Registra tu propia empresa</a>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
