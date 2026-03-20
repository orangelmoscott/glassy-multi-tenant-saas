const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Tenant = require('../models/Tenant');
const Client = require('../models/Client');
const { authenticate } = require('../middlewares/auth');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

/**
 * GET | Generar Factura PDF del Servicio
 */
router.get('/:id/invoice', authenticate, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('clientId');
        
        if (!assignment) return res.status(404).send({ message: 'Ruta no encontrada' });

        const tenant = await Tenant.findById(req.user.tenantId);
        
        // Generar PDF con los datos reales
        const pdfBuffer = await generateInvoicePDF({
            tenant: tenant,
            client: assignment.clientId,
            assignment: assignment
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Factura_Glassy_${assignment._id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar la factura' });
    }
});

/**
 * GET | Todas las asignaciones (Rutas) del Tenant
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const assignments = await Assignment.find({ tenantId: req.user.tenantId })
            .populate('clientId', 'companyName address phone')
            .sort({ date: -1 });
        res.send(assignments);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener asignaciones' });
    }
});

/**
 * POST | Crear nueva asignación
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { clientId, date, notes, workerName, price } = req.body;
        
        const newAssignment = new Assignment({
            tenantId: req.user.tenantId,
            clientId,
            date: date || new Date(),
            notes,
            // Agregamos workerName y price aunque no estén en el modelo base original, 
            // los manejamos dinámicamente o actualizamos el modelo.
            workerName: workerName || 'Sin asignar',
            price: price || 0,
            createdBy: req.user.id
        });

        await newAssignment.save();
        const populated = await newAssignment.populate('clientId', 'companyName address');
        res.status(201).send(populated);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al crear la asignación' });
    }
});

/**
 * PATCH | Actualizar estado
 */
router.patch('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId },
            { status },
            { new: true }
        );
        res.send(assignment);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar estado' });
    }
});

module.exports = router;
