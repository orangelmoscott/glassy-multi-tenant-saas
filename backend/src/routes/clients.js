const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticate, authorize } = require('../middlewares/auth');
const { checkClientLimit, checkTrialStatus } = require('../middlewares/planGuard');

/**
 * GET /clients — Listar solo mis clientes (Aislamiento Multi-tenant)
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const clients = await Client.find({ 
            tenantId: req.user.tenantId, 
            isDeleted: { $ne: true } 
        })
            .sort({ companyName: 1 })
            .lean(); // usar lean para poder inyectar propiedades

        // Calcular progreso del mes actual (basado en visitas reales registradas en este mes)
        const Assignment = require('../models/Assignment');
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const allAssignments = await Assignment.find({
            tenantId: req.user.tenantId,
            isDeleted: { $ne: true }
        }).lean();

        const enhancedClients = clients.map(client => {
            // Un cliente puede tener múltiples asignaciones (ej: una que empezó el mes pasado y sigue, y otra nueva)
            // Lógica base esperada según frecuencia
            let expected = 1; // mensual
            if (client.frequency === 'semanal') expected = 4;
            if (client.frequency === 'quincenal') expected = 2;

            // Contar visitas realizadas DENTRO del mes actual para este cliente
            let completedInMonth = 0;
            allAssignments.filter(a => a.clientId.toString() === client._id.toString()).forEach(a => {
                if (a.visitLogs && a.visitLogs.length > 0) {
                    a.visitLogs.forEach(log => {
                        const logDate = new Date(log.date);
                        if (logDate >= startOfMonth) {
                            completedInMonth++;
                        }
                    });
                } else if (a.status === 'completado' && a.completedAt && new Date(a.completedAt) >= startOfMonth) {
                    // Fallback para asignaciones antiguas sin visitLogs
                    completedInMonth++;
                }
            });

            return {
                ...client,
                monthlyProgress: {
                    completed: completedInMonth,
                    totalAssigned: expected,
                    expected
                }
            };
        });

        res.send(enhancedClients);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al obtener clientes' });
    }
});

/**
 * POST /clients — Crear cliente en mi Tenant (Protegido por Plan SaaS)
 */
router.post('/', authenticate, authorize(['owner', 'admin']), checkTrialStatus, checkClientLimit, async (req, res) => {
    try {
        const clientData = {
            ...req.body,
            tenantId: req.user.tenantId
        };
        
        const client = new Client(clientData);
        await client.save();
        res.status(201).send({ message: 'Cliente creado con éxito', client });
    } catch (error) {
        res.status(400).send({ message: 'Error al crear cliente', error: error.message });
    }
});

/**
 * PATCH /clients/:id — Actualizar datos de un cliente
 */
router.patch('/:id', authenticate, authorize(['owner', 'admin']), checkTrialStatus, async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId },
            { $set: req.body },
            { new: true }
        );
        if (!client) return res.status(404).send({ message: 'Cliente no encontrado' });

        // Propagar precio a rutas pendientes si el precio del cliente cambió
        if (req.body.price !== undefined) {
             const Assignment = require('../models/Assignment');
             await Assignment.updateMany(
                 { clientId: client._id, tenantId: req.user.tenantId, status: { $ne: 'completado' } },
                 { $set: { price: req.body.price } }
             );
        }

        res.send({ message: 'Cliente actualizado con éxito y precios de rutas sincronizados', client });
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar cliente' });
    }
});

/**
 * DELETE /clients/:id — Eliminar cliente de mi empresa
 */
router.delete('/:id', authenticate, authorize(['owner', 'admin']), checkTrialStatus, async (req, res) => {
    try {
        const deleted = await Client.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId },
            { isDeleted: true }
        );
        if (!deleted) return res.status(404).send({ message: 'Cliente no encontrado' });
        res.send({ message: 'Cliente eliminado (archivado) correctamente' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar cliente' });
    }
});

module.exports = router;
