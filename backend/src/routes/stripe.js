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

        // Determinar base URL para el redireccionamiento (Dinámica desde el origen o configuración)
        const baseUrl = req.body.origin || process.env.BASE_URL_FRONTEND || 'https://glassy-saas.onrender.com';

        // Crear sesión de Stripe
        const sessionOptions = {
            mode: 'subscription',
            payment_method_types: ['card'],
            billing_address_collection: 'required',
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
            // Desactivado para evitar errores 500 si no está configurado en el Dashboard
            // automatic_tax: { enabled: true }, 
            success_url: `${baseUrl}/app/settings?session_id={CHECKOUT_SESSION_ID}&status=success`,
            cancel_url: `${baseUrl}/app/settings?status=cancel`,
            metadata: {
                tenantId: tenant._id.toString(),
                planId: planId
            }
        };

        // Si ya tenemos un cliente en Stripe, lo usamos. Si no, usamos el email.
        if (tenant.stripeCustomerId) {
            sessionOptions.customer = tenant.stripeCustomerId;
        } else {
            sessionOptions.customer_email = tenant.email;
        }

        const session = await stripe.checkout.sessions.create(sessionOptions);

        res.send({ 
            url: session.url, 
            id: session.id 
            // session // debug
        });
    } catch (error) {
        console.error('ERROR STRIPE DETALLADO:', {
            message: error.message,
            type: error.type,
            raw: error.raw
        });
        res.status(500).send({ 
            message: 'Error al conectar con Stripe',
            details: error.message 
        });
    }
});

module.exports = router;
