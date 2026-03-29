const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nif: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, required: true },
    logo: { type: String, default: '' }, // Base64
    bankAccount: { type: String, default: '' }, // IBAN o cuenta para facturas
    website: { type: String, default: '' },
    
    // Configuración SaaS y Facturación (Stripe)
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
    planId: { 
        type: String, 
        enum: ['autonomo', 'pro', 'business'], 
        default: 'autonomo' 
    },
    planActivo: { type: Boolean, default: false },
    proximoCobro: { type: Date, default: null },
    canceladoEn: { type: Date, default: null },

    subscriptionStatus: { 
        type: String, 
        enum: ['active', 'inactive', 'past_due', 'trial', 'canceled'], 
        default: 'trial' 
    },
    
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Tenant', tenantSchema);
