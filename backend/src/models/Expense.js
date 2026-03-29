const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['material', 'combustible', 'dieta', 'seguro', 'otros'], 
        default: 'otros' 
    },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    invoiceLink: String // Para guardar referencia a facturas de compra si se desea
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
