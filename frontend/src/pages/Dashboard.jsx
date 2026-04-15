import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, Users, HardHat, Calendar, 
  TrendingUp, ArrowUpRight, CheckCircle, Clock,
  DollarSign, Sparkles, RefreshCcw, Briefcase, 
  LayoutDashboard, FileText
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
                     <div className="animate-spin text-blue-600">
                        <RefreshCcw size={40} />
                     </div>
                </div>
            </DashboardLayout>
        );
    }

    const cards = [
        { 
            label: 'Facturación Mensual', 
            value: `${stats?.totalRevenue?.toFixed(2) || 0}€`, 
            icon: DollarSign, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            subtitle: 'Bruto acumulado este mes'
        },
        { 
            label: 'Gastos Totales', 
            value: `${stats?.totalExpenses?.toFixed(2) || 0}€`, 
            icon: FileText, 
            color: 'text-red-500', 
            bg: 'bg-red-50',
            subtitle: 'Costes operativos registrados'
        },
        { 
            label: 'Beneficio Estimado', 
            value: `${((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0)).toFixed(2)}€`, 
            icon: TrendingUp, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            subtitle: 'Neto antes de impuestos'
        },
        { 
            label: 'Rutas Finalizadas', 
            value: stats?.completedAssignments || 0, 
            icon: CheckCircle, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50',
            subtitle: `De ${stats?.totalAssignments || 0} totales`
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                            <LayoutDashboard className="text-blue-600" size={32} /> Resumen Ejecutivo
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium italic">Monitoriza el rendimiento de {user.companyName} en tiempo real.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <Calendar className="text-blue-500" size={20} />
                        <div className="flex items-center gap-2">
                             <select 
                                 value={month} 
                                 onChange={(e) => setMonth(parseInt(e.target.value))}
                                 className="outline-none font-bold text-slate-700 bg-transparent cursor-pointer uppercase text-sm"
                             >
                                 {['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'].map((m, i) => (
                                     <option key={i} value={i}>{m}</option>
                                 ))}
                             </select>
                             <select 
                                 value={year} 
                                 onChange={(e) => setYear(parseInt(e.target.value))}
                                 className="outline-none font-bold text-slate-700 bg-transparent cursor-pointer text-sm"
                             >
                                 {[2024, 2025, 2026, 2027].map(y => (
                                     <option key={y} value={y}>{y}</option>
                                 ))}
                             </select>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
                        >
                            <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <card.icon size={28} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</p>
                                <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2">{card.subtitle}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Breakdown Section */}
                <div className="grid md:grid-cols-12 gap-8">
                    {/* Revenue Breakdown */}
                    <div className="md:col-span-12 lg:col-span-7 bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black flex items-center gap-3"><TrendingUp className="text-blue-400" /> Distribución de Ingresos</h2>
                                <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">Mes Actual</span>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base de Servicios</p>
                                    <h4 className="text-4xl font-black">{(stats?.baseRevenue || 0).toFixed(2)}€</h4>
                                    <div className="w-full h-2 bg-white/5 rounded-full mt-4">
                                        <div 
                                            className="h-full bg-blue-400 rounded-full shadow-lg shadow-blue-500/50" 
                                            style={{ width: `${(stats?.baseRevenue / (stats?.totalRevenue || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Servicios Extras</p>
                                    <h4 className="text-4xl font-black text-blue-400">+{(stats?.extraRevenue || 0).toFixed(2)}€</h4>
                                    <div className="w-full h-2 bg-white/5 rounded-full mt-4">
                                        <div 
                                            className="h-full bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50" 
                                            style={{ width: `${(stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-tight">Los trabajos extra representan el <span className="text-blue-400 font-black">{((stats?.extraRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span> de tus ingresos totales este mes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Workers Leaderboard */}
                    <div className="md:col-span-12 lg:col-span-5 bg-white rounded-[50px] p-10 border border-slate-100 shadow-xl flex flex-col justify-between">
                        <div className="space-y-6">
                             <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                 <Users className="text-blue-500" /> Rendimiento de Operarios
                             </h2>
                             
                             <div className="space-y-4">
                                 {stats?.topWorkers?.map((worker, i) => (
                                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">
                                                 #{i + 1}
                                             </div>
                                             <p className="font-bold text-slate-700 text-sm">{worker.name || 'Operario'}</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-xs font-black text-slate-900">{worker.count} servicios</p>
                                             <p className="text-[9px] text-emerald-600 font-bold uppercase">+{worker.extra.toFixed(2)}€ extras</p>
                                         </div>
                                     </div>
                                 ))}
                                 {(!stats?.topWorkers || stats.topWorkers.length === 0) && (
                                     <p className="text-center text-slate-400 text-xs italic py-10">Esperando datos de servicios completados...</p>
                                 )}
                             </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                             <button className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                 Gestionar Equipo de Campo
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
