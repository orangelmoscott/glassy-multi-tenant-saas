import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, Users, HardHat, Calendar, 
  TrendingUp, ArrowUpRight, CheckCircle, Clock,
  DollarSign, Sparkles, RefreshCcw, Briefcase, 
  LayoutDashboard, FileText, ChevronRight,
  Target, Zap, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchStats();
    }, [month, year]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://glassy.es/api/dashboard/stats?month=${month}&year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                     <div className="animate-spin text-[#635bff]">
                        <RefreshCcw size={40} />
                     </div>
                </div>
            </DashboardLayout>
        );
    }

    const cards = [
        { 
            label: 'Ingresos Mensuales', 
            value: `${stats?.totalRevenue?.toFixed(2) || 0}€`, 
            icon: DollarSign, 
            color: 'text-[#635bff]', 
            bg: 'bg-indigo-50',
            subtitle: 'Bruto acumulado',
            trend: '+12.5%'
        },
        { 
            label: 'Gastos Totales', 
            value: `${stats?.totalExpenses?.toFixed(2) || 0}€`, 
            icon: FileText, 
            color: 'text-rose-500', 
            bg: 'bg-rose-50',
            subtitle: 'Costes operativos',
            trend: '-2.4%'
        },
        { 
            label: 'Beneficio Neto', 
            value: `${((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0)).toFixed(2)}€`, 
            icon: TrendingUp, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            subtitle: 'Antes de impuestos',
            trend: '+18.2%'
        },
        { 
            label: 'Servicios', 
            value: stats?.completedAssignments || 0, 
            icon: CheckCircle, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50',
            subtitle: `De ${stats?.totalAssignments || 0} totales`,
            trend: 'Óptimo'
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-12">
                {/* ─── Hero Header ─── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#635bff]">
                            <Sparkles size={16} className="animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Resumen Ejecutivo</span>
                        </div>
                        <h1 className="text-4xl font-bold text-[#0a2540] tracking-tight">Hola, {user.fullName?.split(' ')[0] || 'Admin'} 👋</h1>
                        <p className="text-sm text-[#697386] font-medium">Aquí tienes el rendimiento de <span className="text-[#0a2540] font-bold">{user.companyName}</span> para este periodo.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#e3e8ee] shadow-sm hover:border-[#635bff] transition-all group">
                            <Calendar className="text-[#697386] group-hover:text-[#635bff] transition-colors" size={16} />
                            <select 
                                value={month} 
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="outline-none font-bold text-[#0a2540] bg-transparent cursor-pointer text-xs uppercase tracking-tight"
                            >
                                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                                    <option key={i} value={i}>{m}</option>
                                ))}
                            </select>
                            <div className="h-4 w-px bg-[#e3e8ee]"></div>
                            <select 
                                value={year} 
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="outline-none font-bold text-[#0a2540] bg-transparent cursor-pointer text-xs"
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ─── Metrics Grid ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="stripe-card p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <card.icon size={80} />
                            </div>
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center shadow-sm border border-white/50 group-hover:scale-110 transition-transform`}>
                                    <card.icon size={24} />
                                </div>
                                <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                    card.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 
                                    card.trend.includes('-') ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                                } border border-black/5`}>
                                    {card.trend}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest">{card.label}</p>
                                <h3 className="text-3xl font-bold text-[#0a2540] tracking-tighter">{card.value}</h3>
                                <p className="text-[10px] text-[#697386] font-medium mt-1">{card.subtitle}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ─── Main Content Grid ─── */}
                <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Revenue Breakdown */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-8 stripe-card p-8 bg-white relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-[#0a2540] flex items-center gap-2">
                                    <Activity className="text-[#635bff]" size={20} />
                                    Distribución de Ingresos
                                </h2>
                                <p className="text-xs text-[#697386] font-medium">Análisis detallado de fuentes de facturación.</p>
                            </div>
                            <div className="text-[10px] font-bold text-[#635bff] bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 tracking-wider">
                                TIEMPO REAL
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-16 relative">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest mb-1">Ingresos Base</p>
                                        <h4 className="text-4xl font-bold text-[#0a2540] tracking-tighter">{(stats?.baseRevenue || 0).toFixed(2)}€</h4>
                                    </div>
                                    <span className="text-xs font-bold text-[#635bff] mb-1">{((stats?.baseRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-2 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee]">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats?.baseRevenue / (stats?.totalRevenue || 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-[#635bff] to-[#4f46e5] rounded-full shadow-[0_0_10px_rgba(99,91,255,0.3)]" 
                                    />
                                </div>
                                <p className="text-[10px] text-[#697386] font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#635bff]"></div>
                                    Contratos y servicios recurrentes activos.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#697386] uppercase tracking-widest mb-1">Ingresos Extras</p>
                                        <h4 className="text-4xl font-bold text-[#00d4ff] tracking-tighter">{(stats?.extraRevenue || 0).toFixed(2)}€</h4>
                                    </div>
                                    <span className="text-xs font-bold text-[#00d4ff] mb-1">{((stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-2 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee]">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00b4d8] rounded-full shadow-[0_0_10px_rgba(0,212,255,0.3)]" 
                                    />
                                </div>
                                <p className="text-[10px] text-[#697386] font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#00d4ff]"></div>
                                    Trabajos adicionales fuera de contrato.
                                </p>
                            </div>
                        </div>

                        <div className="mt-16 bg-gradient-to-r from-[#0a2540] to-[#1a3b5a] p-6 rounded-2xl flex items-center gap-6 text-white shadow-xl">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-300 border border-white/10 shrink-0">
                                <Zap size={28} className="fill-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-tight">Insight de Negocio</p>
                                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                                    Los servicios extra representan el <span className="text-white font-bold">{((stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span> de la facturación total. <span className="text-indigo-300 font-bold">¡Buen trabajo!</span> Los servicios adicionales aumentan significativamente el margen.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Workers Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 stripe-card p-8 bg-white"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-[#0a2540] flex items-center gap-2">
                                <Target className="text-[#635bff]" size={20} />
                                Operarios Top
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {stats?.topWorkers?.map((worker, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-4 border border-[#f6f9fc] bg-[#fcfdfe] rounded-2xl group hover:border-[#635bff]/30 hover:bg-white hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 cursor-default"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-9 h-9 ${
                                            i === 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                            i === 1 ? 'bg-slate-50 text-slate-400 border-slate-100' : 
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        } rounded-xl flex items-center justify-center text-xs font-bold border`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#0a2540]">{worker.name || 'Operario'}</p>
                                            <p className="text-[10px] text-[#697386] font-medium">{worker.count} servicios finalizados</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                            <TrendingUp size={10} />
                                            {worker.extra.toFixed(0)}€
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {(!stats?.topWorkers || stats.topWorkers.length === 0) && (
                                <div className="text-center py-16">
                                    <div className="w-12 h-12 bg-[#f6f9fc] rounded-full flex items-center justify-center mx-auto mb-4 text-[#aab7c4] border border-[#e3e8ee]">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-xs text-[#697386] font-bold">Sin actividad registrada</p>
                                    <p className="text-[10px] text-[#aab7c4] mt-1">Asigna rutas para ver el ranking.</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => window.location.href = '/app/workers'}
                            className="w-full mt-10 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#e3e8ee] text-xs font-bold text-[#697386] hover:bg-[#f6f9fc] hover:text-[#635bff] hover:border-[#635bff] transition-all uppercase tracking-widest group"
                        >
                            Ver equipo completo
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
