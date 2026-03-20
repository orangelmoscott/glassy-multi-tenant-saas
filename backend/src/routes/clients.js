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
        const clients = await Client.find({ tenantId: req.user.tenantId }).sort({ companyName: 1 });
        res.send(clients);
    } catch (error) {
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
        const deleted = await Client.findOneAndDelete({ 
            _id: req.params.id, 
            tenantId: req.user.tenantId 
        });
        if (!deleted) return res.status(404).send({ message: 'Cliente no encontrado' });
        res.send({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar cliente' });
    }
});

module.exports = router;
