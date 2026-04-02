const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { authenticate } = require('../middlewares/auth');
const { requireProfessionalPlan } = require('../middlewares/planGuard');

/**
 * GET | Listar Gastos de la Empresa
 */
router.get('/', authenticate, requireProfessionalPlan, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const expenses = await Expense.find({ tenantId }).sort({ date: -1 });
        res.send(expenses);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener gastos' });
    }
});

/**
 * POST | Crear Nuevo Gasto
 */
router.post('/', authenticate, requireProfessionalPlan, async (req, res) => {
    try {
        const newExpense = new Expense({
            ...req.body,
            tenantId: req.user.tenantId,
            createdBy: req.user.id
        });
        await newExpense.save();
        res.send(newExpense);
    } catch (error) {
        res.status(400).send({ message: 'Error al crear gasto' });
    }
});

/**
 * DELETE | Borrar Gasto
 */
router.delete('/:id', authenticate, requireProfessionalPlan, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
        res.send({ message: 'Gasto eliminado' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar gasto' });
    }
});

module.exports = router;
