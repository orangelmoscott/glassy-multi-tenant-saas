import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const RegisterCompany = () => {
    const [searchParams] = useSearchParams();
    const planFromUrl = searchParams.get('plan') || 'starter';

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
            // URL del backend de Glassy (asumiendo que corre en el mismo host o env variable)
            const response = await axios.post('https://glassy-backend.onrender.com/auth/register-company', formData);
            if (response.status === 201) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl text-center border-t-8 border-green-500"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Bienvenido a Glassy!</h2>
                    <p className="text-slate-600 mb-8">Empresa registrada con éxito. Redirigiendo al login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-3xl m-4 border border-slate-200">
            {/* Left Content (Branding) */}
            <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                
                <div className="relative z-10">
                    <Link to="/" className="group flex items-center gap-2 mb-8 text-blue-100 hover:text-white transition-all">
                        <ArrowRight className="rotate-180 transform group-hover:-translate-x-1 transition-transform" size={18} />
                        <span className="font-bold text-sm">Volver a Inicio</span>
                    </Link>

                    <Link to="/" className="inline-block">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-xl hover:scale-105 transition-all">
                            <span className="text-blue-600 font-extrabold text-2xl">G</span>
                        </div>
                    </Link>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">Empecemos a digitalizar tu negocio</h1>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-sm">Únete a cientos de empresas que ya gestionan sus servicios de limpieza con Glassy.</p>
                </div>

                <div className="relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
                    <div className="flex items-center gap-3 text-white font-bold mb-3">
                        <ShieldCheck size={20} className="text-cyan-300" />
                        Seguridad Multi-tenant
                    </div>
                    <p className="text-blue-50 text-sm">Tus datos y facturas están aislados y encriptados de forma independiente para tu empresa.</p>
                </div>
            </div>

            {/* Right Content (Form) */}
            <div className="w-full md:w-7/12 bg-white p-8 md:p-16 flex flex-col justify-center overflow-y-auto max-h-screen">
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Crea tu cuenta</h2>
                    <p className="text-slate-500 mb-8 flex items-center gap-2">
                        Plan seleccionado: <span className="text-blue-600 font-bold capitalize">{formData.plan}</span>
                    </p>

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm mb-6 rounded-r-lg font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Empresa</label>
                                <div className="relative group">
                                    <Building className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                    <input 
                                        type="text" name="companyName" placeholder="Nombre Comercial" required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">NIF/CIF</label>
                                <div className="relative group">
                                    <input 
                                        type="text" name="nif" placeholder="A12345678" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email de Empresa</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500" size={18}/>
                                <input 
                                    type="email" name="email" placeholder="contacto@empresa.com" required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 my-4 pt-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Datos del Administrador</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="relative group">
                                        <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500" size={18}/>
                                        <input 
                                            type="text" name="fullName" placeholder="Nombre completo" required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500" size={18}/>
                                        <input 
                                            type="text" name="phone" placeholder="Teléfono" required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-500 ml-1">Usuario</label>
                                <input 
                                    type="text" name="username" placeholder="usuario_admin" required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500" size={18}/>
                                    <input 
                                        type="password" name="password" placeholder="••••••••" required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className={`w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mt-6 shadow-xl shadow-slate-200 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                        >
                            {loading ? 'Preparando tu clúster...' : 'Crear mi Empresa en Glassy'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                    <p className="text-center mt-8 text-slate-500 text-sm">
                        ¿Ya eres miembro? <a href="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterCompany;
