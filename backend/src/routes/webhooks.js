const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tenant = require('../models/Tenant');

/**
 * GET /stripe-health — Diagnostic route at root level
 */
router.get('/stripe-health', (req, res) => {
    res.json({ status: 'active', secret: !!process.env.STRIPE_WEBHOOK_SECRET });
});

/**
 * Webhook route at explicit path /webhook/stripe
 */
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📩 WEBHOOK RECIBIDO');
    console.log('  Signature:', sig ? 'presente' : '❌ AUSENTE');
    console.log('  Body type:', typeof req.body);
    console.log('  Body is Buffer:', Buffer.isBuffer(req.body));
    console.log('  Body length:', req.body?.length || 0);
    console.log('  Secret configurado:', !!process.env.STRIPE_WEBHOOK_SECRET);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let event;

    // PASO 1: Verificar firma de Stripe
    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log('✅ Firma verificada. Evento:', event.type, '| ID:', event.id);
    } catch (err) {
        console.error('❌ FALLO DE FIRMA:', err.message);
        console.error('  Esto significa que:');
        console.error('  - STRIPE_WEBHOOK_SECRET no coincide con el secreto del webhook en Stripe Dashboard');
        console.error('  - O el body fue parseado como JSON antes de llegar aquí (middleware order)');
        return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    // PASO 2: Procesar el evento
    try {
        const obj = event.data.object;

        switch (event.type) {
            // ═══════════════════════════════════════════════════════
            // CHECKOUT COMPLETADO — El usuario terminó de pagar
            // Este es el evento MÁS IMPORTANTE para activar el plan
            // ═══════════════════════════════════════════════════════
            case 'checkout.session.completed': {
                const tenantId = obj.metadata?.tenantId;
                const planId = obj.metadata?.planId;
                const customerId = obj.customer;
                const subscriptionId = obj.subscription;

                console.log('🎉 CHECKOUT COMPLETED');
                console.log('  tenantId:', tenantId);
                console.log('  planId:', planId);
                console.log('  customerId:', customerId);
                console.log('  subscriptionId:', subscriptionId);
                console.log('  payment_status:', obj.payment_status);

                if (tenantId && obj.payment_status === 'paid') {
                    const updateData = {
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        subscriptionStatus: 'active',
                        planActivo: true
                    };
                    
                    // Si se pasó el planId en metadata, actualizarlo también
                    if (planId) {
                        updateData.planId = planId;
                    }

                    const result = await Tenant.findByIdAndUpdate(tenantId, updateData, { new: true });
                    console.log('  ✅ Tenant actualizado:', result ? result.name : '❌ NO ENCONTRADO');
                } else {
                    console.log('  ⚠️ No se actualizó: tenantId ausente o pago no completado');
                }
                break;
            }

            // ═══════════════════════════════════════════════════════
            // FACTURA PAGADA — Confirmación de cobro recurrente
            // ═══════════════════════════════════════════════════════
            case 'invoice.paid': {
                const customerId = obj.customer;
                const subscriptionId = obj.subscription;

                console.log('💰 INVOICE PAID | customer:', customerId);

                let current_period_end = null;
                if (subscriptionId) {
                    const sub = await stripe.subscriptions.retrieve(subscriptionId);
                    current_period_end = sub.current_period_end;
                }

                const result = await Tenant.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        planActivo: true,
                        subscriptionStatus: 'active',
                        proximoCobro: current_period_end ? new Date(current_period_end * 1000) : null
                    },
                    { new: true }
                );
                console.log('  ✅ Resultado:', result ? `${result.name} activado` : '❌ Tenant no encontrado por customerId');
                break;
            }

            // ═══════════════════════════════════════════════════════
            // PAGO FALLIDO
            // ═══════════════════════════════════════════════════════
            case 'invoice.payment_failed': {
                const customerId = obj.customer;
                console.log('❌ PAYMENT FAILED | customer:', customerId);
                await Tenant.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    { planActivo: false, subscriptionStatus: 'past_due' }
                );
                break;
            }

            // ═══════════════════════════════════════════════════════
            // SUSCRIPCIÓN CREADA/ACTUALIZADA — Sincronizar planId
            // ═══════════════════════════════════════════════════════
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const customerId = obj.customer;
                const subscriptionId = obj.id;
                const productId = obj.items?.data?.[0]?.price?.product;
                
                console.log('📋 SUBSCRIPTION', event.type, '| customer:', customerId, '| status:', obj.status);

                let planId = 'autonomo'; // default
                if (productId) {
                    const product = await stripe.products.retrieve(productId);
                    planId = product.metadata?.plan_id || 'autonomo';
                }

                const result = await Tenant.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        stripeSubscriptionId: subscriptionId,
                        planId: planId,
                        planActivo: obj.status === 'active' || obj.status === 'trialing',
                        subscriptionStatus: obj.status,
                        proximoCobro: obj.current_period_end ? new Date(obj.current_period_end * 1000) : null
                    },
                    { new: true }
                );
                console.log('  ✅ Resultado:', result ? `${result.name} → plan ${planId}` : '❌ Tenant no encontrado');
                break;
            }

            // ═══════════════════════════════════════════════════════
            // SUSCRIPCIÓN CANCELADA
            // ═══════════════════════════════════════════════════════
            case 'customer.subscription.deleted': {
                const customerId = obj.customer;
                console.log('🗑️ SUBSCRIPTION DELETED | customer:', customerId);
                await Tenant.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    { planActivo: false, subscriptionStatus: 'canceled', canceladoEn: new Date() }
                );
                break;
            }

            default:
                console.log('ℹ️ Evento no manejado:', event.type);
        }

        // SIEMPRE responder 200 para que Stripe no reintente
        res.json({ received: true });

    } catch (dbError) {
        console.error('❌ ERROR DE BASE DE DATOS en webhook:', dbError.message);
        // Aún así responder 200 para evitar reintentos de Stripe por errores de DB
        // Los reintentos de Stripe con errores de DB causan duplicados
        res.json({ received: true, warning: 'DB error logged' });
    }
});

module.exports = router;
