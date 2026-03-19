const mongoose = require('mongoose');

const serviceLogSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    date: { type: Date, default: Date.now },
    
    // SaaS Multi-tenancy
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true 
    },
    
    basePrice: Number,
    ivaAmount: Number,
    totalPrice: Number,
    signature: String,
    verifiedBy: String,
    status: { type: String, default: 'completado' }
});

module.exports = mongoose.model('ServiceLog', serviceLogSchema);
