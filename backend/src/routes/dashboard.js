const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Client = require('../models/Client');
const User = require('../models/User');
const Expense = require('../models/Expense');
const { authenticate } = require('../middlewares/auth');
const { requireProfessionalPlan } = require('../middlewares/planGuard');

/**
 * GET | Obtener Estadísticas Globales del Negocio
 */
router.get('/stats', authenticate, requireProfessionalPlan, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const now = new Date();
        const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
        const month = req.query.month ? parseInt(req.query.month) : now.getMonth(); // 0-indexed

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        // 1. Clientes Activos
        const totalClients = await Client.countDocuments({ 
            tenantId, 
            isDeleted: false 
        });

        // 2. Operarios
        const totalWorkers = await User.countDocuments({ 
            tenantId, 
            role: { $in: ['worker', 'cristalero'] } 
        });

        // 3. Asignaciones del Mes
        const assignments = await Assignment.find({
            tenantId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            isDeleted: false
        });

        // 4. Gastos del Mes
        const expenses = await Expense.find({
            tenantId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const stats = {
            totalClients,
            totalWorkers,
            totalAssignments: assignments.length,
            completedAssignments: assignments.filter(a => a.status === 'completado').length,
            pendingAssignments: assignments.filter(a => a.status === 'pendiente' || a.status === 'en_ruta').length,
            totalRevenue: 0,
            baseRevenue: 0,
            extraRevenue: 0,
            totalExpenses: 0,
            topWorkers: []
        };

        // 5. Rendimiento de Operarios
        const workerStats = {};
        assignments.forEach(as => {
            if (as.status === 'completado' && as.workerId) {
                const wId = as.workerId.toString();
                if (!workerStats[wId]) workerStats[wId] = { count: 0, extra: 0 };
                workerStats[wId].count++;
                
                const extras = as.extraServices ? as.extraServices.reduce((sum, e) => sum + (e.price || 0), 0) : 0;
                workerStats[wId].extra += extras;
            }
        });

        const sortedWorkers = Object.entries(workerStats)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Poblar con nombres
        for(let w of sortedWorkers) {
            const user = await User.findById(w.id).select('name');
            if (user) w.name = user.name;
        }
        stats.topWorkers = sortedWorkers;


        expenses.forEach(ex => {
            stats.totalExpenses += (ex.amount || 0);
        });


        assignments.forEach(as => {
            if (as.status === 'completado') {
                const base = as.price || 0;
                const extras = as.extraServices ? as.extraServices.reduce((sum, e) => sum + (e.price || 0), 0) : 0;
                
                stats.baseRevenue += base;
                stats.extraRevenue += extras;
                stats.totalRevenue += (base + extras);
            }
        });

        res.send(stats);
    } catch (error) {
        console.error('Error in dashboard stats:', error);
        res.status(500).send({ message: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
