const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    encargado: String,
    nif: { type: String, required: true },
    address: String,
    phone: String,
    email: { type: String, required: true },
    serviceType: {
        type: String,
        enum: ['hogar', 'oficina', 'restaurante', 'tienda'],
        required: true
    },
    frequency: {
        type: String,
        enum: ['semanal', 'quincenal', 'mensual'],
        required: true
    },
    basePrice: { type: Number, required: true },
    active: { type: Boolean, default: true },
    
    // El núcleo del SaaS: un cliente pertenece a UNA empresa (Tenant)
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true 
    },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
