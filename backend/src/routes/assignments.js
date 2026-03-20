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
 * GET | Sus propias asignaciones (Acceso para Cristaleros)
 */
router.get('/my', authenticate, async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            tenantId: req.user.tenantId, 
            workerId: req.user.userId,
            status: { $ne: 'completado' } // Solo pendientes para el operario
        })
        .populate('clientId', 'companyName address phone')
        .sort({ date: 1 });
        res.send(assignments);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener tus asignaciones' });
    }
});

/**
 * POST | Crear nueva asignación (Asignar a un operario específico)
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { clientId, date, notes, workerId, price } = req.body;
        
        const newAssignment = new Assignment({
            tenantId: req.user.tenantId,
            userId: req.user.userId, // El que crea la ruta (Admin/Owner)
            clientId,
            date: date || new Date(),
            notes,
            workerId, // Usuario con rol cristalero
            price: price || 0,
            createdBy: req.user.userId
        });

        await newAssignment.save();
        const populated = await Assignment.findById(newAssignment._id).populate([
            { path: 'clientId', select: 'companyName address' },
            { path: 'workerId', select: 'fullName username' }
        ]);
        res.status(201).send(populated);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al crear la asignación' });
    }
});

/**
 * PATCH | Completar Trabajo con Firma Digital
 */
router.patch('/:id/complete', authenticate, async (req, res) => {
    try {
        const { signature, notes } = req.body;
        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId },
            { 
                status: 'completado', 
                signature, 
                notes: notes || 'Servicio finalizado con firma del cliente.',
                completedAt: new Date()
            },
            { new: true }
        );
        res.send({ message: 'Servicio validado con firma', assignment });
    } catch (error) {
        res.status(500).send({ message: 'Error al validar servicio' });
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
