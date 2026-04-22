import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building, Mail, Phone, CreditCard, Shield, 
  Upload, Save, RefreshCcw, Sparkles, CheckCircle,
  FileBadge, MapPin, Briefcase, PartyPopper, X, ChevronRight
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
    const [paymentActivated, setPaymentActivated] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        const status = params.get('status');

        if (status === 'success' && sessionId) {
            checkPaymentStatus(sessionId);
        } else if (status === 'cancel') {
            window.history.replaceState({}, document.title, '/app/settings');
            setError('Pago cancelado. Puedes reactivar tu suscripción cuando quieras.');
            setTimeout(() => setError(null), 5000);
            fetchSettings();
        } else {
            fetchSettings();
        }
    }, []);
    
    const checkPaymentStatus = async (sessionId) => {
        try {
            const res = await axios.post(
                'https://glassy.es/api/tenant/sync-subscription', 
                { sessionId },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            const updatedTenant = res.data.tenant;
            const currentUser = JSON.parse(localStorage.getItem('glassy_user') || '{}');
            const newUser = { 
                ...currentUser, 
                plan: updatedTenant.planId, 
                planId: updatedTenant.planId,
                planActivo: true,
                trialDaysLeft: null
            };
            localStorage.setItem('glassy_user', JSON.stringify(newUser));
            window.history.replaceState({}, document.title, '/app/settings');

            setPaymentActivated(true);
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            console.error('Error al sincronizar pago:', err);
            fetchSettings();
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/tenant/my-company', {
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
            await axios.patch('https://glassy.es/api/tenant/update', tenant, {
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
            const res = await axios.post('https://glassy.es/api/stripe/create-checkout-session', { 
                planId,
                origin: window.location.origin 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.url) {
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

    const handleManageBilling = async () => {
        try {
            setSaving(true);
            const res = await axios.post('https://glassy.es/api/stripe/create-portal-session', {
                origin: window.location.origin
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al abrir el portal de facturación');
        } finally {
            setSaving(false);
        }
    };

    if (paymentActivated) return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center gap-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-100"
            >
                <CheckCircle size={48} />
            </motion.div>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#0a2540]">¡Pago Confirmado!</h2>
                <p className="text-[#697386] font-medium">Actualizando tu suscripción...</p>
            </div>
        </div>
    );

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[60vh]">
                <RefreshCcw className="animate-spin text-[#635bff]" size={32} />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Ajustes de Empresa</h1>
                        <p className="text-sm text-[#697386] mt-1">Configura tu identidad corporativa y facturación.</p>
                    </div>
                </div>

                {/* Notifications */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800"
                        >
                            <AlertTriangle size={18} className="text-rose-500" />
                            <p className="text-xs font-bold">{error}</p>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800"
                        >
                            <CheckCircle size={18} className="text-emerald-500" />
                            <p className="text-xs font-bold">Cambios guardados con éxito.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Side: Logo & Plan */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="stripe-card p-8 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-[#697386] uppercase tracking-wider mb-6">Logo de Empresa</span>
                            
                            <div className="relative group mb-6">
                                <div className="w-40 h-40 bg-[#f6f9fc] border-2 border-dashed border-[#e3e8ee] rounded-2xl flex items-center justify-center overflow-hidden group-hover:border-[#635bff] transition-all">
                                    {tenant.logo ? (
                                        <img src={tenant.logo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Upload className="text-[#aab7c4]" size={32} />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#635bff] text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#0a2540] transition-all">
                                    <Upload size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            </div>
                            <p className="text-center text-[10px] text-[#697386] font-medium leading-relaxed px-4">
                                Se usará en facturas PDF y comunicaciones.
                            </p>
                        </div>

                        {/* Plan Summary Card */}
                        <div className="stripe-card p-8 bg-[#0a2540] text-white border-none shadow-none relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest mb-1 block">Plan Actual</span>
                                <h3 className="text-2xl font-bold capitalize mb-6">{tenant.planId || 'Starter'}</h3>
                                
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-100/70">
                                        <Shield size={14} className="text-[#635bff]" /> Multi-tenant Seguro
                                    </div>
                                    {!tenant.planActivo && (
                                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-white/5 flex items-center gap-3 mt-4">
                                            <Sparkles className="text-amber-400" size={18} />
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-400 uppercase leading-none mb-1">Prueba Activa</p>
                                                <p className="text-sm font-bold">{tenant.trialDaysLeft} días restantes</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => tenant.planActivo ? handleManageBilling() : setIsPricingModalOpen(true)}
                                    className="w-full bg-white/10 hover:bg-white text-white hover:text-[#0a2540] border border-white/10 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? <RefreshCcw className="animate-spin" size={14} /> : (
                                        <>
                                            <Sparkles size={14} /> 
                                            {tenant.planActivo ? 'Portal de Facturación' : 'Mejorar Plan'}
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#635bff]/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    {/* Right Side: Forms */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="stripe-card p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Building size={20} className="text-[#635bff]" />
                                <h3 className="text-lg font-bold text-[#0a2540]">Información General</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Razón Social</label>
                                    <input 
                                        type="text" value={tenant.name || ''} 
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">NIF / CIF</label>
                                    <input 
                                        type="text" value={tenant.nif || ''}
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={(e) => setTenant({ ...tenant, nif: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Email Público</label>
                                    <input 
                                        type="email" value={tenant.email || ''}
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={(e) => setTenant({ ...tenant, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Teléfono</label>
                                    <input 
                                        type="text" value={tenant.phone || ''}
                                        className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                        onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Dirección Fiscal</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3.5 text-[#aab7c4]" size={18} />
                                        <input 
                                            type="text" value={tenant.address || ''} 
                                            className="w-full pl-11 pr-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                            onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stripe-card p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <CreditCard size={20} className="text-[#635bff]" />
                                <h3 className="text-lg font-bold text-[#0a2540]">Datos de Pago para Clientes</h3>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">IBAN / Número de Cuenta</label>
                                <input 
                                    type="text" value={tenant.bankAccount || ''} placeholder="ES00 0000 0000 0000 0000 0000"
                                    className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]"
                                    onChange={(e) => setTenant({ ...tenant, bankAccount: e.target.value })}
                                />
                                <p className="text-[10px] text-[#697386] font-medium ml-1">Se imprimirá en tus facturas para cobros bancarios.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                disabled={saving}
                                className="bg-[#0a2540] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#635bff] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Guardando...' : 'Guardar Configuración'}
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
