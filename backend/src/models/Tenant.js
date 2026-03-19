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
    
    // Configuración SaaS
    subscriptionStatus: { 
        type: String, 
        enum: ['active', 'inactive', 'past_due', 'trial'], 
        default: 'trial' 
    },
    plan: { type: String, enum: ['free', 'starter', 'professional'], default: 'free' },
    
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);
