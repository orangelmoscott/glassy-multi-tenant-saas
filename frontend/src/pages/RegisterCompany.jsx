import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building, Phone, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
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
            <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl text-center border border-[#e3e8ee]"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0a2540] mb-2">¡Empresa Registrada!</h2>
                    <p className="text-[#697386] mb-8 font-medium">Te estamos redirigiendo para que puedas acceder a tu panel.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f9fc] flex flex-col lg:flex-row">
            {/* Branding Panel */}
            <div className="lg:w-[40%] bg-[#0a2540] p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-500 rounded-full blur-[150px]"></div>
                </div>
                
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold text-sm mb-12 transition-all group">
                        <ChevronLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" /> Volver
                    </Link>
                    
                    <div className="w-12 h-12 bg-[#635bff] rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-2xl tracking-tighter">G</span>
                    </div>
                    
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">Digitaliza tu negocio de limpieza</h1>
                    <p className="text-indigo-100/70 text-lg font-medium max-w-sm">La plataforma integral para gestionar rutas, clientes y facturación en un solo lugar.</p>
                </div>

                <div className="relative z-10 mt-12 pt-12 border-t border-white/10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-indigo-400 border border-white/10">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Privacidad por diseño</p>
                            <p className="text-indigo-100/60 text-xs font-medium mt-1">Infraestructura multi-inquilino segura y aislada.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Panel */}
            <div className="flex-1 bg-white p-8 lg:p-20 flex flex-col justify-center items-center overflow-y-auto">
                <div className="w-full max-w-[480px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-[#0a2540] tracking-tight">Crea tu cuenta</h2>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[#697386] text-sm font-medium">Plan seleccionado:</span>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-[#635bff] text-xs font-bold rounded-md border border-indigo-100 uppercase tracking-wider">{formData.plan}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-rose-500" />
                            <p className="text-xs text-rose-800 font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Empresa</label>
                                <input 
                                    type="text" name="companyName" placeholder="Nombre Comercial" required
                                    className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">NIF / CIF</label>
                                <input 
                                    type="text" name="nif" placeholder="B12345678" required
                                    className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Email Profesional</label>
                            <input 
                                type="email" name="email" placeholder="contacto@empresa.com" required
                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pt-4 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-[#e3e8ee]"></div>
                                <span className="text-[10px] font-bold text-[#aab7c4] uppercase tracking-widest">Datos Administrador</span>
                                <div className="h-px flex-1 bg-[#e3e8ee]"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Nombre Completo</label>
                                    <input 
                                        type="text" name="fullName" placeholder="Tu nombre" required
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Teléfono</label>
                                    <input 
                                        type="text" name="phone" placeholder="600 000 000" required
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Usuario Admin</label>
                                    <input 
                                        type="text" name="username" placeholder="usuario_admin" required
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Contraseña</label>
                                    <input 
                                        type="password" name="password" placeholder="••••••••" required
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff]"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-[#635bff] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0a2540] transition-all shadow-lg shadow-indigo-100 mt-6 disabled:opacity-50"
                        >
                            {loading ? 'Creando cuenta...' : 'Finalizar Registro'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                    
                    <p className="mt-8 text-center text-sm text-[#697386] font-medium">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-[#635bff] font-bold hover:underline">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterCompany;
