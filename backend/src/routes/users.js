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

module.exports = router;
