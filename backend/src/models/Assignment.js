const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pendiente', 'en_ruta', 'completado'],
        default: 'pendiente'
    },
    notes: { type: String, default: '' },
    
    // SaaS Multi-tenancy
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true 
    },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

assignmentSchema.index({ userId: 1, date: 1, tenantId: 1 });
module.exports = mongoose.model('Assignment', assignmentSchema);
