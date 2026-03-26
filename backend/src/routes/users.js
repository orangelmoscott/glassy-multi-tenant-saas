const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * GET | Listar todos los operarios (workers) del Tenant
 */
router.get('/workers', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        const workers = await User.find({ 
            tenantId: req.user.tenantId, 
            role: 'cristalero' 
        }).select('-password');
        res.send(workers);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener operarios' });
    }
});

/**
 * POST | Crear un nuevo operario
 */
router.post('/workers', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        const { username, password, fullName, phone } = req.body;
        
        // Verificar si el usuario ya existe
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).send({ message: 'El nombre de usuario ya está en uso' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const worker = new User({
            username,
            password: hashedPassword,
            role: 'cristalero',
            fullName,
            phone,
            tenantId: req.user.tenantId // Hereda el tenant del owner que lo crea
        });

        await worker.save();
        
        const workerResponse = worker.toObject();
        delete workerResponse.password;
        
        res.status(201).send(workerResponse);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear operario' });
    }
});

/**
 * PATCH | Actualizar datos de un operario
 */
router.patch('/workers/:id', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        const { fullName, phone, password } = req.body;
        const updateData = { fullName, phone };
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId, role: 'cristalero' },
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).send({ message: 'Operario no encontrado' });
        res.send(user);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar operario' });
    }
});

/**
 * DELETE | Eliminar operario
 */
router.delete('/workers/:id', authenticate, authorize(['owner', 'admin']), async (req, res) => {
    try {
        const deleted = await User.findOneAndDelete({ 
            _id: req.params.id, 
            tenantId: req.user.tenantId,
            role: 'cristalero' 
        });
        if (!deleted) return res.status(404).send({ message: 'Operario no encontrado' });
        res.send({ message: 'Operario eliminado correctamente' });
    } catch (error) {
        console.error('Delete worker error:', error);
        res.status(500).send({ message: 'Error al eliminar operario', error: error.message });
    }
});

module.exports = router;
