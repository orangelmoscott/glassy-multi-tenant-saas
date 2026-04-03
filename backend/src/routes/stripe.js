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
            'basico': 'price_1TGQMNBFGOxLufnn2SfOQ2zA',
            'autonomo': 'price_1TGQMNBFGOxLufnn2SfOQ2zA', // Retrocompatibilidad
            'pro': 'price_1TGQMOBFGOxLufnnDtecYCBG',
            'business': 'price_1TGPx5BFGOxLufnnM50qMNz7'
        };

        const priceId = priceIds[planId];
        if (!priceId) return res.status(400).send({ message: 'Plan no válido' });

        // Determinar base URL para el redireccionamiento (Dinámica desde el origen o configuración)
        let baseUrl = req.body.origin || process.env.BASE_URL_FRONTEND || 'https://glassy-saas.onrender.com';
        // Eliminar barra final si existe
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        // Configuración robusta de la sesión
        const sessionOptions = {
            mode: 'subscription',
            allow_promotion_codes: true, // Útil para cupones en el futuro
            billing_address_collection: 'required',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                metadata: {
                    tenantId: tenant._id.toString(),
                    planId: planId
                }
            },
            success_url: `${baseUrl}/app/settings?session_id={CHECKOUT_SESSION_ID}&status=success`,
            cancel_url: `${baseUrl}/app/settings?status=cancel`,
            metadata: {
                tenantId: tenant._id.toString(),
                planId: planId
            }
        };

        // Si ya tenemos un cliente válido en Stripe, lo usamos.
        if (tenant.stripeCustomerId && tenant.stripeCustomerId.startsWith('cus_')) {
            sessionOptions.customer = tenant.stripeCustomerId;
        } else {
            sessionOptions.customer_email = tenant.email;
        }

        console.log('CREANDO SESIÓN STRIPE CON:', JSON.stringify(sessionOptions, null, 2));
        
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
