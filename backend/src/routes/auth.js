const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

/**
 * REGISTRO SAAS (Empresa + Dueño)
 * 1. Crea la Empresa (Tenant)
 * 2. Crea el Usuario (Owner)
 */
router.post('/register-company', async (req, res) => {
    try {
        const { companyName, nif, email, username, password, fullName, phone } = req.body;

        // Validaciones profesionales
        if (!companyName || !nif || !email || !username || !password) {
            return res.status(400).send({ message: 'Todos los campos básicos son obligatorios.' });
        }

        // 1. Crear la Empresa (Tenant)
        const tenant = new Tenant({
            name: companyName,
            nif,
            email,
            phone: phone || '',
            subscriptionStatus: 'trial' // Empieza en periodo de prueba de 14 días (ejemplo)
        });
        await tenant.save();

        // 2. Crear el Usuario (Rol Owner)
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            role: 'owner', // El que se registra de cero es el dueño
            fullName,
            phone,
            tenantId: tenant._id // Vincular a la empresa recién creada
        });
        await user.save();

        // Vincular ID del dueño a la empresa
        tenant.ownerId = user._id;
        await tenant.save();

        res.status(201).send({ message: 'Empresa registrada con éxito', userId: user._id, tenantId: tenant._id });
    } catch (error) {
        res.status(500).send({ message: 'Error en el registro del SaaS', error: error.message });
    }
});

/**
 * LOGIN SAAS
 * Extrae y confirma el tenantId para seguridad
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).populate('tenantId');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ message: 'Credenciales incorrectas' });
        }

        if (!user.active) {
            return res.status(403).send({ message: 'Tu cuenta ha sido desactivada. Contacta al soporte.' });
        }

        // Generar Token JWT con tenantId
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                role: user.role, 
                tenantId: user.tenantId._id,
                fullName: user.fullName 
            },
            process.env.SECRET_KEY,
            { expiresIn: '8h' }
        );

        res.send({
            token,
            username: user.username,
            role: user.role,
            companyName: user.tenantId.name,
            tenantId: user.tenantId._id,
            plan: user.tenantId.plan,
            userId: user._id
        });

    } catch (error) {
        res.status(500).send({ message: 'Error en el servidor de autenticación' });
    }
});

module.exports = router;
