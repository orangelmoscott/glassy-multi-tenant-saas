const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tenant = require('../models/Tenant');

// Se usa express.raw para conservar el body original requerido por Stripe para validar la firma
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        const obj = event.data.object;

        switch (event.type) {
            case 'checkout.session.completed': {
                const tenantId = obj.metadata.tenantId;
                const customerId = obj.customer;
                const subscriptionId = obj.subscription;

                if (tenantId) {
                    await Tenant.findByIdAndUpdate(tenantId, {
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        subscriptionStatus: 'active',
                        planActivo: true
                    });
                }
                break;
            }
            case 'invoice.paid': {
                const customerId = obj.customer;
                const subscriptionId = obj.subscription;
                const tenantId = obj.metadata?.tenantId; // Intentar sacar de metadata de la factura

                let current_period_end = 0;
                let status = 'active';

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    current_period_end = subscription.current_period_end;
                    status = subscription.status;
                }

                // Si no hay metadata en invoice, buscar por customerId
                const query = tenantId ? { _id: tenantId } : { stripeCustomerId: customerId };

                await Tenant.findOneAndUpdate(
                    query,
                    {
                        planActivo: true,
                        proximoCobro: current_period_end ? new Date(current_period_end * 1000) : null,
                        subscriptionStatus: status
                    }
                );
                break;
            }
            case 'invoice.payment_failed': {
                const customerId = obj.customer;
                await Tenant.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        planActivo: false,
                        subscriptionStatus: 'past_due'
                    }
                );
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const customerId = obj.customer;
                const subscriptionId = obj.id;
                const productId = obj.items.data[0].price.product;
                const tenantId = obj.metadata?.tenantId;

                const product = await stripe.products.retrieve(productId);
                const planId = product.metadata.plan_id || 'autonomo';

                const query = tenantId ? { _id: tenantId } : { stripeCustomerId: customerId };

                await Tenant.findOneAndUpdate(
                    query,
                    {
                        stripeSubscriptionId: subscriptionId,
                        planId: planId,
                        planActivo: obj.status === 'active' || obj.status === 'trialing',
                        subscriptionStatus: obj.status,
                        proximoCobro: new Date(obj.current_period_end * 1000)
                    }
                );
                break;
            }
            case 'customer.subscription.deleted': {
                const customerId = obj.customer;
                await Tenant.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        planActivo: false,
                        subscriptionStatus: 'canceled',
                        canceladoEn: new Date()
                    }
                );
                break;
            }
            default:
                console.log(`Evento de webhook no manejado explícitamente: ${event.type}`);
        }

        res.json({ received: true });
    } catch (dbError) {
        console.error('Error procesando webhook en DB:', dbError);
        res.status(500).send('Error interno en procesamiento de base de datos de webhook');
    }
});

module.exports = router;
