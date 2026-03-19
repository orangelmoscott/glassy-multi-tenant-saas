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

module.exports = router;
