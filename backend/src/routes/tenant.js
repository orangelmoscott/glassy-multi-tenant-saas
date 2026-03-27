const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * GET | Mi Empresa (Tenant Profile)
 */
router.get('/my-company', authenticate, async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.tenantId).lean();
        if (!tenant) return res.status(404).send({ message: 'Empresa no encontrada' });
        
        // Cálculo días restantes (Starter)
        const trialLimit = 7 * 24 * 60 * 60 * 1000;
        const diff = new Date() - new Date(tenant.createdAt);
        tenant.trialDaysLeft = tenant.plan === 'starter' ? Math.max(0, Math.ceil((trialLimit - diff) / (24 * 60 * 60 * 1000))) : null;

        res.send(tenant);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener la empresa' });
    }
});

/**
 * PATCH | Actualizar Datos de la Empresa (Logo, NIF, Cuenta Bancaria, etc.)
 * Solo accesible para el Dueño o administradores con permisos.
 */
router.patch('/update', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        // SEGURIDAD: Solo se actualiza el tenantId del usuario autenticado
        const tenant = await Tenant.findByIdAndUpdate(
            req.user.tenantId, 
            req.body, 
            { new: true }
        );
        res.send({ message: 'Empresa actualizada con éxito', tenant });
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar empresa' });
    }
});

module.exports = router;
