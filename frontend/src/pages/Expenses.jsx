import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Receipt, Plus, Trash2, Calendar, 
  DollarSign, Tag, FileText, Search,
  RefreshCcw, AlertCircle, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'material',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const token = user.token;

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await axios.get('https://glassy.es/api/expenses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://glassy.es/api/expenses', newExpense, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setNewExpense({
                description: '',
                amount: '',
                category: 'material',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            fetchExpenses();
        } catch (err) {
            alert('Error al crear gasto');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este gasto?')) return;
        try {
            await axios.delete(`https://glassy.es/api/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExpenses();
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    const categories = {
        material: { label: 'Material Limpieza', color: 'bg-blue-100 text-blue-700' },
        combustible: { label: 'Combustible / Vehículo', color: 'bg-amber-100 text-amber-700' },
        dieta: { label: 'Dietas / Comidas', color: 'bg-purple-100 text-purple-700' },
        seguro: { label: 'Seguros / Cuotas', color: 'bg-emerald-100 text-emerald-700' },
        otros: { label: 'Otros Gastos', color: 'bg-slate-100 text-slate-700' }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <Receipt className="text-red-500" size={36} /> Control de Gastos
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium italic">Registra cada coste operativo para calcular tu beneficio real.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white px-8 py-4 rounded-[25px] font-black flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                        <Plus size={20} /> Nuevo Gasto
                    </button>
                </div>

                {/* Summary Mini Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-lg flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                            <ShoppingCart size={30} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gasto Total Acumulado</p>
                            <h3 className="text-3xl font-black text-slate-900">
                                {expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}€
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Content: Expense List */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                             <Tag size={16} /> Registro de Operaciones
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-3 text-slate-300" size={18} />
                            <input 
                                type="text" placeholder="Buscar gasto..." 
                                className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-blue-400 transition-all w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Concepto</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Importe</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {expenses.map((expense) => (
                                        <motion.tr 
                                            key={expense._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50/40 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    <span className="text-sm font-bold text-slate-600">{new Date(expense.date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{expense.description}</span>
                                                    {expense.notes && <span className="text-[10px] text-slate-400 font-medium italic">{expense.notes}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${categories[expense.category]?.color || 'bg-slate-100 text-slate-600'}`}>
                                                    {categories[expense.category]?.label || 'Otro'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-black text-slate-900">
                                                {expense.amount.toFixed(2)}€
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDelete(expense._id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {expenses.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
                                            <p className="text-slate-400 font-bold italic">No hay gastos registrados aún.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-10">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-xl rounded-[45px] shadow-2xl relative z-10 overflow-hidden"
                            >
                                <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                        <Plus className="text-blue-600" /> Registrar Gasto
                                    </h2>
                                </div>
                                <form onSubmit={handleCreate} className="p-10 space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Concepto</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-4 text-slate-300" size={20} />
                                                <input 
                                                    required type="text" placeholder="Ej: Jabón Industrial, Gasolina..."
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-800"
                                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Importe (€)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-4 text-slate-300" size={20} />
                                                    <input 
                                                        required type="number" step="0.01" placeholder="0.00"
                                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                                                <input 
                                                    required type="date" value={newExpense.date}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-800"
                                                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría Operativa</label>
                                            <select 
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-800 appearance-none"
                                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                                value={newExpense.category}
                                            >
                                                {Object.entries(categories).map(([val, { label }]) => (
                                                    <option key={val} value={val}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas Adicionales (Opcional)</label>
                                            <textarea 
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-800 h-24 resize-none"
                                                placeholder="Detalles sobre el gasto..."
                                                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            type="button" onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[20px] font-black hover:bg-slate-200 transition-all"
                                        >
                                            CANCELAR
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex-2 px-10 py-5 bg-slate-900 text-white rounded-[20px] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                        >
                                            GUARDAR GASTO
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default Expenses;
