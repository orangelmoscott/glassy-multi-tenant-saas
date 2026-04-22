import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Receipt, Plus, Trash2, Calendar, 
  DollarSign, Tag, FileText, Search,
  RefreshCcw, AlertCircle, ShoppingCart, X, ChevronRight
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
        material: { label: 'Material', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        combustible: { label: 'Vehículo', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        dieta: { label: 'Dietas', color: 'bg-purple-50 text-purple-600 border-purple-100' },
        seguro: { label: 'Seguros', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        otros: { label: 'Otros', color: 'bg-slate-50 text-slate-600 border-slate-100' }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0a2540] tracking-tight">Gastos</h1>
                        <p className="text-sm text-[#697386] mt-1">Control de costes operativos y compras.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#635bff] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#4f46e5] transition-all shadow-lg shadow-indigo-100"
                    >
                        <Plus size={18} /> Nuevo Gasto
                    </button>
                </div>

                {/* Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stripe-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#697386] uppercase tracking-wider">Total Acumulado</p>
                            <h3 className="text-2xl font-bold text-[#0a2540]">
                                {expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}€
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="stripe-card overflow-hidden bg-white border border-[#e3e8ee]">
                    <div className="p-6 border-b border-[#f6f9fc] flex flex-col md:flex-row justify-between gap-4 items-center">
                        <h3 className="text-xs font-bold text-[#697386] uppercase tracking-wider flex items-center gap-2">
                             <Receipt size={14} /> Registro de Gastos
                        </h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-2.5 text-[#aab7c4]" size={16} />
                            <input 
                                type="text" placeholder="Buscar gasto..." 
                                className="w-full pl-9 pr-4 py-2 bg-[#f6f9fc] border border-[#e3e8ee] rounded-lg text-sm font-medium outline-none focus:border-[#635bff] transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fcfdfe] text-[#697386] text-[10px] font-bold uppercase tracking-wider border-b border-[#e3e8ee]">
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Concepto</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4 text-right">Importe</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f6f9fc]">
                                {loading ? (
                                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-6 py-8 h-16 bg-[#fcfdfe]"></td></tr>)
                                ) : expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <tr key={expense._id} className="hover:bg-[#fcfdfe] transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-[#0a2540]">
                                                    <Calendar size={14} className="text-[#aab7c4]" />
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#0a2540]">{expense.description}</span>
                                                    {expense.notes && <span className="text-[10px] text-[#697386] font-medium truncate max-w-xs">{expense.notes}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categories[expense.category]?.color || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                                    {categories[expense.category]?.label || 'Otro'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-[#0a2540]">
                                                {expense.amount.toFixed(2)}€
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(expense._id)}
                                                    className="p-2 text-[#697386] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <Receipt size={48} className="mb-4" />
                                                <p className="text-sm font-bold">No hay gastos registrados.</p>
                                            </div>
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
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a2540]/40 backdrop-blur-sm">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 border-b border-[#e3e8ee] flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-[#0a2540]">Registrar Gasto</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#f6f9fc] rounded-lg transition-all text-[#697386]">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreate} className="p-6 space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Concepto</label>
                                        <input 
                                            required type="text" placeholder="Ej: Material de limpieza, Combustible..."
                                            className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Importe (€)</label>
                                            <input 
                                                required type="number" step="0.01" placeholder="0.00"
                                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-bold text-[#0a2540]"
                                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Fecha</label>
                                            <input 
                                                required type="date" value={newExpense.date}
                                                className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540]"
                                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Categoría</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-semibold text-[#0a2540] appearance-none"
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            value={newExpense.category}
                                        >
                                            {Object.entries(categories).map(([val, { label }]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#697386] uppercase tracking-wider ml-1">Notas</label>
                                        <textarea 
                                            className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl outline-none focus:border-[#635bff] font-medium text-[#0a2540] h-24 resize-none"
                                            placeholder="Detalles opcionales..."
                                            onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-[#635bff] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#4f46e5] shadow-lg shadow-indigo-100 transition-all mt-2"
                                    >
                                        Guardar Gasto
                                    </button>
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
