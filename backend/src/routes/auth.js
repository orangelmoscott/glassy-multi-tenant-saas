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
        const { companyName, nif, email, username, password, fullName, phone, plan } = req.body;

        // Validaciones profesionales
        if (!companyName || !nif || !email || !username || !password) {
            return res.status(400).send({ message: 'Todos los campos básicos son obligatorios.' });
        }

        // 1. Crear la Empresa (Tenant) con el plan seleccionado
        const tenant = new Tenant({
            name: companyName,
            nif,
            email,
            phone: phone || '',
            planId: plan || 'starter',
            subscriptionStatus: plan === 'starter' ? 'trial' : 'incomplete'
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

        // Cálculo de días restantes de prueba (Starter)
        const trialLimit = 7 * 24 * 60 * 60 * 1000;
        const tenantCreated = new Date(user.tenantId.createdAt);
        const now = new Date();
        const diff = now - tenantCreated;
        const daysLeft = Math.max(0, Math.ceil((trialLimit - diff) / (24 * 60 * 60 * 1000)));

        res.send({
            token,
            username: user.username,
            role: user.role,
            companyName: user.tenantId.name,
            tenantId: user.tenantId._id,
            plan: user.tenantId.planId,
            planId: user.tenantId.planId,
            planActivo: user.tenantId.planActivo,
            trialDaysLeft: user.tenantId.planId === 'starter' ? daysLeft : null,
            userId: user._id
        });

    } catch (error) {
        res.status(500).send({ message: 'Error en el servidor de autenticación' });
    }
});

const crypto = require('crypto');
const { sendHTMLEmail } = require('../utils/mailer');

/**
 * SOLICITAR RECUPERACIÓN DE CONTRASEÑA
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        // Buscar el tenant que tiene ese email
        const tenant = await Tenant.findOne({ email });
        if (!tenant) {
            // No revelamos si el email existe por seguridad, pero enviamos 200
            return res.send({ message: 'Si el correo está registrado, recibirás instrucciones.' });
        }

        // Buscar al dueño de ese tenant
        const user = await User.findById(tenant.ownerId);
        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Generar token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        // Enviar email
        const resetUrl = `https://glassy-saas.onrender.com/reset-password/${token}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 24px;">
                <h2 style="color: #0f172a;">Recuperación de Contraseña - Glassy</h2>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Restablecer Contraseña</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
            </div>
        `;

        await sendHTMLEmail(tenant.email, 'Restablecer contraseña - Glassy SaaS', html);
        res.send({ message: 'Si el correo está registrado, recibirás instrucciones.' });

    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).send({ message: 'Error al procesar la solicitud.' });
    }
});

/**
 * RESTABLECER CONTRASEÑA
 */
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ message: 'El token es inválido o ha expirado.' });
        }

        // Hashear nueva contraseña
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.send({ message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al restablecer contraseña.' });
    }
});

module.exports = router;
