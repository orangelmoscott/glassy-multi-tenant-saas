import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, Users, HardHat, Calendar, 
  TrendingUp, ArrowUpRight, CheckCircle, Clock,
  DollarSign, Sparkles, RefreshCcw, Briefcase, 
  LayoutDashboard, FileText, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
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
            subtitle: 'Bruto acumulado'
        },
        { 
            label: 'Gastos Totales', 
            value: `${stats?.totalExpenses?.toFixed(2) || 0}€`, 
            icon: FileText, 
            color: 'text-rose-500', 
            bg: 'bg-rose-50',
            subtitle: 'Costes operativos'
        },
        { 
            label: 'Beneficio Neto', 
            value: `${((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0)).toFixed(2)}€`, 
            icon: TrendingUp, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            subtitle: 'Antes de impuestos'
        },
        { 
            label: 'Servicios', 
            value: stats?.completedAssignments || 0, 
            icon: CheckCircle, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50',
            subtitle: `De ${stats?.totalAssignments || 0} totales`
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Resumen Ejecutivo</h1>
                        <p className="text-sm text-[#697386] mt-1">Control de rendimiento para {user.companyName}.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e3e8ee] shadow-sm">
                        <Calendar className="text-[#697386]" size={16} />
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="outline-none font-bold text-[#0a2540] bg-transparent cursor-pointer text-xs uppercase tracking-tight"
                        >
                            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="stripe-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center`}>
                                    <card.icon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">{card.subtitle}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-[#697386] uppercase tracking-wider">{card.label}</p>
                                <h3 className="text-2xl font-bold text-[#0a2540]">{card.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Revenue Breakdown */}
                    <div className="lg:col-span-8 stripe-card p-8 bg-white overflow-hidden relative">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-lg font-bold text-[#0a2540] flex items-center gap-2">
                                <TrendingUp className="text-[#635bff]" size={20} />
                                Distribución de Ingresos
                            </h2>
                            <div className="text-[10px] font-bold text-[#635bff] bg-indigo-50 px-2 py-1 rounded">ESTADÍSTICAS DEL MES</div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-[#697386] uppercase tracking-wider mb-1">Ingresos Base</p>
                                    <h4 className="text-3xl font-bold text-[#0a2540]">{(stats?.baseRevenue || 0).toFixed(2)}€</h4>
                                </div>
                                <div className="w-full h-1.5 bg-[#f6f9fc] rounded-full">
                                    <div 
                                        className="h-full bg-[#635bff] rounded-full" 
                                        style={{ width: `${(stats?.baseRevenue / (stats?.totalRevenue || 1)) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-[#697386] font-medium">Contratos y servicios recurrentes activos.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-[#697386] uppercase tracking-wider mb-1">Ingresos Extras</p>
                                    <h4 className="text-3xl font-bold text-[#00d4ff]">{(stats?.extraRevenue || 0).toFixed(2)}€</h4>
                                </div>
                                <div className="w-full h-1.5 bg-[#f6f9fc] rounded-full">
                                    <div 
                                        className="h-full bg-[#00d4ff] rounded-full" 
                                        style={{ width: `${(stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-[#697386] font-medium">Trabajos adicionales fuera de contrato.</p>
                            </div>
                        </div>

                        <div className="mt-12 bg-[#f6f9fc] border border-[#e3e8ee] p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg border border-[#e3e8ee] flex items-center justify-center text-[#635bff] shadow-sm">
                                <Sparkles size={18} />
                            </div>
                            <p className="text-xs text-[#425466] font-semibold leading-relaxed">
                                Los servicios extra representan el <span className="text-[#0a2540] font-bold">{((stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span> de la facturación. Considera promocionar estos servicios.
                            </p>
                        </div>
                    </div>

                    {/* Top Workers */}
                    <div className="lg:col-span-4 stripe-card p-8 bg-white">
                        <h2 className="text-lg font-bold text-[#0a2540] flex items-center gap-2 mb-8">
                            <Users className="text-[#635bff]" size={20} />
                            Equipo de Campo
                        </h2>

                        <div className="space-y-4">
                            {stats?.topWorkers?.map((worker, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-[#f6f9fc] bg-[#fcfdfe] rounded-xl group hover:bg-white hover:border-[#e3e8ee] transition-all cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 bg-indigo-50 text-[#635bff] rounded-lg flex items-center justify-center text-[10px] font-bold">
                                            #{i + 1}
                                        </div>
                                        <span className="text-xs font-bold text-[#0a2540]">{worker.name || 'Operario'}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-bold text-[#0a2540]">{worker.count} serv.</p>
                                        <p className="text-[9px] text-emerald-600 font-bold">+{worker.extra.toFixed(0)}€ extra</p>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.topWorkers || stats.topWorkers.length === 0) && (
                                <div className="text-center py-10">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <Clock size={20} />
                                    </div>
                                    <p className="text-[10px] text-[#697386] font-medium italic">Sin datos este mes</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => window.location.href = '/app/workers'}
                            className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-lg border border-[#e3e8ee] text-[11px] font-bold text-[#697386] hover:bg-[#f6f9fc] hover:text-[#0a2540] transition-all uppercase tracking-wider"
                        >
                            Ver equipo completo
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
