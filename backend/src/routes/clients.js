const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticate, authorize } = require('../middlewares/auth');
const { checkClientLimit } = require('../middlewares/planGuard');

/**
 * GET /clients — Listar solo mis clientes (Aislamiento Multi-tenant)
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const clients = await Client.find({ tenantId: req.user.tenantId, isDeleted: false })
            .sort({ companyName: 1 })
            .lean(); // usar lean para poder inyectar propiedades

        // Calcular progreso del mes actual
        const Assignment = require('../models/Assignment');
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyAssignments = await Assignment.find({
            tenantId: req.user.tenantId,
            date: { $gte: startOfMonth }
        }).lean();

        const enhancedClients = clients.map(client => {
            const clientAssignments = monthlyAssignments.filter(a => a.clientId.toString() === client._id.toString());
            
            // Consideramos visitsDone nativo para el progreso
            const completed = clientAssignments.reduce((sum, a) => sum + (a.visitsDone || (a.status === 'completado' ? 1 : 0)), 0);
            
            // Lógica base esperada según frecuencia
            let expected = 1; // mensual
            if (client.frequency === 'semanal') expected = 4;
            if (client.frequency === 'quincenal') expected = 2;
            
            return {
                ...client,
                monthlyProgress: {
                    completed,
                    totalAssigned: expected, // Simplificado, ahora el target es estricto
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
router.post('/', authenticate, authorize(['owner', 'admin']), checkClientLimit, async (req, res) => {
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
router.patch('/:id', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId },
            { $set: req.body },
            { new: true }
        );
        if (!client) return res.status(404).send({ message: 'Cliente no encontrado' });
        res.send({ message: 'Cliente actualizado con éxito', client });
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar cliente' });
    }
});

/**
 * DELETE /clients/:id — Eliminar cliente de mi empresa
 */
router.delete('/:id', authenticate, authorize(['owner', 'admin']), async (req, res) => {
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
