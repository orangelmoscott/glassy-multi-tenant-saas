const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    date: { type: Date, required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pendiente', 'en_ruta', 'completado'],
        default: 'pendiente'
    },
    notes: { type: String, default: '' },
    price: { type: Number, default: 0 }, // Precio al momento del servicio
    extraServices: [{
        description: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    invoiceNumber: { type: String, default: null },
    signature: { type: String, default: null }, // Firma digital Base64
    completedAt: { type: Date },
    
    expectedVisits: { type: Number, default: 1 }, // Cantidad de visitas al mes (1, 2 o 4)
    visitsDone: { type: Number, default: 0 }, // Visitas realizadas
    visitLogs: [{
        signature: String,
        date: { type: Date, default: Date.now }
    }],
    
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
