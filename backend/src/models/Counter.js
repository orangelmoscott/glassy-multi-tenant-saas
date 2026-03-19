const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    // El id ahora será "tenantId_invoice" para que cada empresa tenga su propio contador sequencial
    id: { type: String, required: true, unique: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
