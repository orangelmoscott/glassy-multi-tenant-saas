import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building, Phone, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft, Sparkles, Zap, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const RegisterCompany = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planFromUrl = searchParams.get('plan') || 'basico';

    const [formData, setFormData] = useState({
        companyName: '',
        nif: '',
        email: '',
        username: '',
        password: '',
        fullName: '',
        phone: '',
        plan: planFromUrl
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('https://glassy.es/api/auth/register-company', formData);
            if (response.status === 201) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center p-6 font-['Figtree']">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-[32px] shadow-2xl text-center border border-[#e3e8ee]"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100 shadow-sm">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#0a2540] mb-2 tracking-tight">¡Bienvenido a Glassy!</h2>
                    <p className="text-[#697386] mb-8 font-medium">Empresa registrada correctamente. Redirigiendo al panel de acceso...</p>
                    <div className="flex justify-center">
                        <div className="w-12 h-1 bg-[#f6f9fc] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="h-full bg-[#635bff] w-1/2"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row font-['Figtree']">
            {/* Branding Panel */}
            <div className="lg:w-[45%] bg-[#0a2540] p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                {/* Stripe-like background effects */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[100%] h-[100%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[100px]"></div>
                </div>
                
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest mb-16 transition-all group">
                        <ChevronLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Volver a la web
                    </Link>
                    
                    <div className="w-14 h-14 bg-[#635bff] rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-indigo-500/30 border border-white/10 group hover:rotate-12 transition-transform cursor-default">
                        <span className="text-white font-bold text-3xl tracking-tighter">G</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[0.95] mb-8">
                        Escala tu negocio <br/>
                        <span className="text-[#00d4ff]">sin límites.</span>
                    </h1>
                    <p className="text-indigo-100/60 text-lg font-medium max-w-md leading-relaxed">
                        Únete a los profesionales que ya han digitalizado su logística con el software #1 del sector.
                    </p>
                </div>

                <div className="relative z-10 mt-12 pt-12 border-t border-white/5 space-y-8">
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Privacidad Certificada</p>
                            <p className="text-indigo-100/40 text-xs font-medium mt-1 leading-relaxed">Infraestructura multi-inquilino segura y aislada bajo normativa europea (RGPD).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Alta Inmediata</p>
                            <p className="text-indigo-100/40 text-xs font-medium mt-1 leading-relaxed">Sin esperas. Tu panel estará listo en menos de 60 segundos tras el registro.</p>
                        </div>
                    </div>
                </div>
                
                <p className="relative z-10 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-12">
                    Glassy SaaS Ecosystem © 2025
                </p>
            </div>

            {/* Form Panel */}
            <div className="flex-1 bg-white p-8 lg:p-24 flex flex-col justify-center items-center overflow-y-auto">
                <div className="w-full max-w-[520px]">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-[#635bff] mb-2">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Empieza hoy</span>
                        </div>
                        <h2 className="text-4xl font-bold text-[#0a2540] tracking-tight mb-3">Crea tu cuenta empresarial</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[#697386] text-sm font-medium">Plan de acceso:</span>
                            <span className="px-3 py-1 bg-indigo-50 text-[#635bff] text-[10px] font-bold rounded-full border border-indigo-100 uppercase tracking-widest">{formData.plan}</span>
                        </div>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <p className="text-xs text-rose-800 font-bold leading-relaxed">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-[#e3e8ee]"></div>
                                <span className="text-[10px] font-bold text-[#aab7c4] uppercase tracking-[0.2em]">Información Fiscal</span>
                                <div className="h-px flex-1 bg-[#e3e8ee]"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Nombre Comercial</label>
                                    <input 
                                        type="text" name="companyName" placeholder="Ej: Cristalera Pro" required
                                        className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">NIF / CIF</label>
                                    <input 
                                        type="text" name="nif" placeholder="B00000000" required
                                        className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Email de Facturación</label>
                                <input 
                                    type="email" name="email" placeholder="administracion@empresa.com" required
                                    className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-[#e3e8ee]"></div>
                                <span className="text-[10px] font-bold text-[#aab7c4] uppercase tracking-[0.2em]">Credenciales de Acceso</span>
                                <div className="h-px flex-1 bg-[#e3e8ee]"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Administrador</label>
                                    <input 
                                        type="text" name="fullName" placeholder="Nombre completo" required
                                        className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Teléfono móvil</label>
                                    <input 
                                        type="text" name="phone" placeholder="+34 600 000 000" required
                                        className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-bold text-[#0a2540] transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">ID de Usuario</label>
                                    <input 
                                        type="text" name="username" placeholder="admin_user" required
                                        className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white font-black text-[#0a2540] transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#697386] uppercase tracking-widest ml-1">Contraseña</label>
                                    <input 
                                        type="password" name="password" placeholder="••••••••" required
                                        className="w-full px-5 py-4 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl outline-none focus:border-[#635bff] focus:bg-white transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-[#635bff] text-white py-5 rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#0a2540] transition-all shadow-xl shadow-indigo-100 mt-10 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Creando infraestructura...' : 'Confirmar y Finalizar Registro'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                    
                    <p className="mt-12 text-center text-sm text-[#697386] font-medium">
                        ¿Ya formas parte de Glassy? <Link to="/login" className="text-[#635bff] font-bold hover:underline">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterCompany;
