import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building, Mail, Phone, CreditCard, Shield, 
  Upload, Save, RefreshCcw, Sparkles, CheckCircle,
  FileBadge, MapPin, Briefcase, PartyPopper, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import PricingModal from '../components/PricingModal';

const CompanySettings = () => {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [paymentActivated, setPaymentActivated] = useState(false); // overlay post-pago
    
    // Sesión
    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        // Primero sincronizar pago si venimos de Stripe, luego cargar settings
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        const status = params.get('status');

        if (status === 'success' && sessionId) {
            checkPaymentStatus(sessionId);
        } else {
            fetchSettings();
        }
    }, []);
    
    // Auto-Heal DEFINITIVO: Sincronizar con Stripe y recargar la página completa
    const checkPaymentStatus = async (sessionId) => {
        try {
            const res = await axios.post(
                'https://glassy-backend.onrender.com/tenant/sync-subscription', 
                { sessionId },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            const updatedTenant = res.data.tenant;

            // 1. Actualizar localStorage CON el nuevo planId
            const currentUser = JSON.parse(localStorage.getItem('glassy_user') || '{}');
            const newUser = { 
                ...currentUser, 
                plan: updatedTenant.planId, 
                planId: updatedTenant.planId,
                planActivo: true,
                trialDaysLeft: null  // Ya no está en prueba
            };
            localStorage.setItem('glassy_user', JSON.stringify(newUser));
            
            // 2. Limpiar URL para que no se repita la sincronización
            window.history.replaceState({}, document.title, '/app/settings');

            // 3. Mostrar overlay de éxito 2s y luego RECARGAR la página completa
            //    Esto garantiza que DashboardLayout re-lea el localStorage actualizado
            //    y elimine el overlay de 'trial expirado' definitivamente.
            setPaymentActivated(true);
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            console.error('Error al sincronizar pago:', err);
            // Si falla la sync automática, al menos cargar settings normalmente
            fetchSettings();
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get('https://glassy-backend.onrender.com/tenant/my-company', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTenant(res.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar la configuración');
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTenant({ ...tenant, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await axios.patch('https://glassy-backend.onrender.com/tenant/update', tenant, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    const handlePlanUpdate = async (planId) => {
        try {
            // Ya no es un simple patch, es una creación de sesión de pago profesional
            const res = await axios.post('https://glassy-backend.onrender.com/stripe/create-checkout-session', { 
                planId,
                origin: window.location.origin 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Redirigir a Stripe Checkout
            if (res.data.url) {
                // Guardar para Auto-Heal global
                if (res.data.id) {
                    localStorage.setItem('stripe_pending_session', res.data.id);
                }
                window.location.href = res.data.url;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al conectar con la pasarela de pago');
            throw err;
        }
    };

    // Pantalla de sincronización de pago (mientras esperamos o mostramos éxito)
    if (paymentActivated) return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center gap-6">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-28 h-28 bg-green-100 rounded-[40px] flex items-center justify-center"
            >
                <CheckCircle className="text-green-600" size={64} strokeWidth={1.5} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-2">¡Pago Confirmado!</h2>
                <p className="text-slate-500 font-medium">Tu suscripción está activa. Redirigiendo al panel...</p>
            </motion.div>
            <div className="animate-spin text-blue-500"><RefreshCcw size={24} /></div>
        </div>
    );

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[70vh]">
                <div className="animate-spin text-blue-600"><RefreshCcw size={40} /></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                            <Briefcase className="text-blue-600" size={36} /> Perfil Corporativo
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Configura la identidad de tu empresa para facturas y servicios.</p>
                    </div>
                </div>

                {/* Banner de Errores o Éxito */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 shadow-xl shadow-red-200/20"
                        >
                            <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/30">
                                <X size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1">Error de Sistema</p>
                                <p className="text-sm font-bold opacity-90">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-xl transition-colors">
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8 p-4 bg-green-50 border border-green-100 rounded-3xl flex items-center gap-4 text-green-600 shadow-xl shadow-green-200/20"
                        >
                            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/30">
                                <CheckCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1">Operación Exitosa</p>
                                <p className="text-sm font-bold opacity-90">Configuración guardada correctamente.</p>
                            </div>
                            <button onClick={() => setSuccess(false)} className="p-2 hover:bg-green-100 rounded-xl transition-colors">
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Branding (Logo) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Identidad Visual</p>
                            
                            <div className="relative group mb-8">
                                <div className="w-48 h-48 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[35px] flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                                    {tenant.logo ? (
                                        <img src={tenant.logo} alt="Empresa Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                                            <span className="text-xs font-bold text-slate-400">Subir Logo PNG/JPG</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95">
                                    <Upload size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            </div>

                            <p className="text-center text-[10px] text-slate-400 font-medium px-4 leading-relaxed">
                                Este logo aparecerá en todas las facturas PDF y notificaciones enviadas a tus clientes. 
                            </p>
                        </div>

                        {/* Plan Card */}
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all"></div>
                            <div className="flex flex-col h-full relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Suscripción Activa</span>
                                <h3 className="text-2xl font-extrabold capitalize mb-6">{tenant.planId || 'Starter'}</h3>
                                
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                                        <Shield size={14} className="text-blue-400" /> Protección Multi-tenant
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                                        <FileBadge size={14} className="text-blue-400" /> Facturación ilimitada
                                    </div>
                                    {['starter', 'trial'].includes(tenant.planId) && (
                                        <div className="mt-4 p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900">
                                                <Sparkles size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-500 uppercase">Periodo de Prueba</p>
                                                <p className="text-sm font-bold text-white">{tenant.trialDaysLeft} días restantes</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => setIsPricingModalOpen(true)}
                                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-inner"
                                >
                                    <Sparkles size={14} className="text-amber-400" /> Gestionar Suscripción
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Forms */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Basic Info Card */}
                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                                <Building size={20} className="text-blue-600" /> Datos de la Empresa
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Razón Social / Nombre Comercial</label>
                                    <input 
                                        type="text" value={tenant.name || ''} 
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner font-bold text-slate-800"
                                        onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">NIF / CIF (Facturación)</label>
                                    <input 
                                        type="text" value={tenant.nif || ''}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner font-bold text-slate-800"
                                        onChange={(e) => setTenant({ ...tenant, nif: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                                        <input 
                                            type="email" value={tenant.email || ''}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner font-bold text-slate-800"
                                            onChange={(e) => setTenant({ ...tenant, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
                                        <input 
                                            type="text" value={tenant.phone || ''}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner font-bold text-slate-800"
                                            onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Dirección Fiscal / Oficina</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
                                    <input 
                                        type="text" value={tenant.address || ''} placeholder="Calle Principal 123, Ciudad, CP"
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner font-bold text-slate-800"
                                        onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Billing Detalis Card */}
                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                                <CreditCard size={20} className="text-blue-600" /> Configuración de Pagos (Para Facturas)
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Número de Cuenta / IBAN</label>
                                    <input 
                                        type="text" value={tenant.bankAccount || ''} placeholder="ES00 0000 0000 0000 0000 0000"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner font-bold text-slate-800"
                                        onChange={(e) => setTenant({ ...tenant, bankAccount: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 ml-1">Este número se imprimirá al pie de tus facturas para que tus clientes sepan dónde pagar.</p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button 
                                disabled={saving}
                                className={`bg-slate-900 text-white px-10 py-5 rounded-[25px] font-extrabold flex items-center gap-3 transition-all filter drop-shadow-lg active:scale-95 ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 hover:-translate-y-1'}`}
                            >
                                {saving ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                                {saving ? 'Guardando cambios...' : 'Guardar Información de Empresa'}
                            </button>
                        </div>
                    </div>
                </form>

                <PricingModal 
                    isOpen={isPricingModalOpen} 
                    onClose={() => setIsPricingModalOpen(false)} 
                    currentPlan={tenant.planId || 'starter'}
                    onSelectPlan={handlePlanUpdate}
                />
            </div>
        </DashboardLayout>
    );
};

export default CompanySettings;
