const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require('../middlewares/auth');
const Tenant = require('../models/Tenant');

/**
 * POST | Crear Sesión de Checkout de Stripe
 * Genera una URL de pago para el plan seleccionado.
 */
router.post('/create-checkout-session', authenticate, async (req, res) => {
    try {
        const { planId } = req.body;
        const tenant = await Tenant.findById(req.user.tenantId);

        if (!tenant) return res.status(404).send({ message: 'Empresa no encontrada' });

        // Mapeo de IDs de precios de Stripe (debes asegurar que coincidan con los que creamos)
        const priceIds = {
            'autonomo': 'price_1TGQMNBFGOxLufnn2SfOQ2zA',
            'pro': 'price_1TGQMOBFGOxLufnnDtecYCBG',
            'business': 'price_1TGQWIBFGOxLufnnfCH6qS0Y'
        };

        const priceId = priceIds[planId];
        if (!priceId) return res.status(400).send({ message: 'Plan no válido' });

        // Crear sesión de Stripe
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: tenant.email,
            billing_address_collection: 'required', // Requerido para facturas profesionales
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                metadata: {
                    tenantId: tenant._id.toString()
                }
            },
            automatic_tax: { enabled: true },
            success_url: `${process.env.BASE_URL_FRONTEND || 'https://glassy-saas.onrender.com'}/app/settings?session_id={CHECKOUT_SESSION_ID}&status=success`,
            cancel_url: `${process.env.BASE_URL_FRONTEND || 'https://glassy-saas.onrender.com'}/app/settings?status=cancel`,
            metadata: {
                tenantId: tenant._id.toString(),
                planId: planId
            }
        });

        res.send({ 
            url: session.url, 
            id: session.id 
        });
    } catch (error) {
        console.error('Error al crear sesión de Stripe:', error);
        res.status(500).send({ message: 'Error al conectar con Stripe' });
    }
});

module.exports = router;
