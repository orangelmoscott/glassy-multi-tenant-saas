const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['owner', 'admin', 'cristalero'],
        default: 'cristalero'
    },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    active: { type: Boolean, default: true },
    
    // El núcleo del SaaS: un usuario pertenece a UNA empresa (Tenant)
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true 
    },
    
    createdAt: { type: Date, default: Date.now }
});

// Índice para asegurar que el username sea único globalmente, pero también podrías 
// considerar si quieres usuarios repetidos en diferentes tenants (más complejo).
// Para este MVP, el username será único global en el sistema.

module.exports = mongoose.model('User', userSchema);
