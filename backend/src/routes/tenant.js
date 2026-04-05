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
        
        // Cálculo días restantes (Cualquier plan NO pagado tiene 7 días de prueba)
        const trialLimit = 7 * 24 * 60 * 60 * 1000;
        const diff = new Date() - new Date(tenant.createdAt);
        tenant.trialDaysLeft = !tenant.planActivo ? Math.max(0, Math.ceil((trialLimit - diff) / (24 * 60 * 60 * 1000))) : null;

        res.send(tenant);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener la empresa' });
    }
});

/**
 * POST | Sincronizar Suscripción con Stripe (Auto-Heal)
 * Se llama cuando el usuario vuelve de Stripe para forzar la actualización si el webhook falló.
 */
router.post('/sync-subscription', authenticate, async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const { sessionId } = req.body;
        const tenant = await Tenant.findById(req.user.tenantId);

        if (!tenant) return res.status(404).send({ message: 'Empresa no encontrada' });

        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid') {
                tenant.planActivo = true;
                tenant.subscriptionStatus = 'active';
                tenant.stripeCustomerId = session.customer;
                tenant.stripeSubscriptionId = session.subscription;
                
                // Si el checkout tenía planId, lo actualizamos
                if (session.metadata.planId) {
                    tenant.planId = session.metadata.planId;
                }
                
                await tenant.save();
                return res.send({ message: 'Sincronización exitosa', tenant });
            }
        }

        res.send({ message: 'No se requiere actualización manual', tenant });
    } catch (error) {
        console.error('Error en sync-subscription:', error);
        res.status(500).send({ message: 'Error sincronizando con Stripe' });
    }
});

/**
 * PATCH | Actualizar Datos de la Empresa (Logo, NIF, Cuenta Bancaria, etc.)
 * Solo accesible para el Dueño o administradores con permisos.
 */
router.patch('/update', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        // SEGURIDAD: Solo permitir campos no sensibles.
        // NUNCA permitir que el usuario actualice planActivo, subscriptionStatus, etc. por aquí.
        const allowedUpdates = [
            'name', 'nif', 'address', 'phone', 'email', 
            'logo', 'bankAccount', 'website'
        ];
        
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Solo si hay algo que actualizar
        if (Object.keys(updates).length === 0) {
            return res.status(400).send({ message: 'No se enviaron campos válidos para actualizar.' });
        }

        const tenant = await Tenant.findByIdAndUpdate(
            req.user.tenantId, 
            updates, 
            { new: true }
        );

        if (!tenant) return res.status(404).send({ message: 'Empresa no encontrada' });

        res.send({ message: 'Empresa actualizada con éxito', tenant });
    } catch (error) {
        console.error('Error al actualizar empresa:', error);
        res.status(500).send({ message: 'Error al actualizar empresa' });
    }
});

module.exports = router;
