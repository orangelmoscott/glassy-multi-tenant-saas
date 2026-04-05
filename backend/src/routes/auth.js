const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

/**
 * REGISTRO SAAS (Empresa + Dueño)
 */
router.post('/register-company', async (req, res) => {
    try {
        const { companyName, nif, email, username, password, fullName, phone, plan } = req.body;

        // Validaciones profesionales
        if (!companyName || !nif || !email || !username || !password) {
            return res.status(400).send({ message: 'Todos los campos básicos son obligatorios.' });
        }

        // Verificaciones de unicidad para evitar Error 500 por duplicados en DB
        const emailExists = await Tenant.findOne({ email });
        if (emailExists) return res.status(400).send({ message: 'El email de empresa ya está registrado.' });

        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).send({ message: 'El nombre de usuario ya está en uso.' });

        // 1. Crear la Empresa (Tenant)
        const tenant = new Tenant({
            name: companyName,
            nif,
            email,
            phone: phone || '',
            planId: plan || 'starter',
            subscriptionStatus: 'trial' // Trial por defecto al registrarse
        });
        await tenant.save();

        // 2. Crear el Usuario (Rol Owner)
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            role: 'owner',
            fullName,
            phone,
            tenantId: tenant._id
        });
        await user.save();

        // Vincular ID del dueño a la empresa
        tenant.ownerId = user._id;
        await tenant.save();

        res.status(201).send({ message: 'Empresa registrada con éxito', userId: user._id, tenantId: tenant._id });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).send({ message: 'Error en el servidor al registrar empresa.' });
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

        // Cálculo de días restantes (Solo si el plan no está activo/pagado)
        const trialLimit = 7 * 24 * 60 * 60 * 1000;
        const diff = new Date() - new Date(user.tenantId.createdAt);
        const daysLeft = !user.tenantId.planActivo ? Math.max(0, Math.ceil((trialLimit - diff) / (24 * 60 * 60 * 1000))) : null;

        res.send({
            token,
            username: user.username,
            role: user.role,
            companyName: user.tenantId.name,
            tenantId: user.tenantId._id,
            plan: user.tenantId.planId,
            planId: user.tenantId.planId,
            planActivo: user.tenantId.planActivo,
            trialDaysLeft: daysLeft,
            userId: user._id
        });

    } catch (error) {
        res.status(500).send({ message: 'Error en el servidor de autenticación' });
    }
});

const crypto = require('crypto');
const { sendHTMLEmail } = require('../utils/mailer');

router.post('/forgot-password', async (req, res) => {
    try {
        const { email, companyName } = req.body;
        // Validación cruzada para asegurar aislamiento entre empresas
        const tenant = await Tenant.findOne({ 
            email: email.toLowerCase().trim(),
            name: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') } // Case-insensitive
        });

        if (!tenant) {
            return res.status(404).send({ message: 'No se encontró ninguna cuenta que coincida con ese Email y Empresa.' });
        }

        // Buscar al dueño de ese tenant
        const user = await User.findById(tenant.ownerId);
        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Generar OTP de 6 dígitos
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
                <h2 style="color: #0f172a;">Recuperación de Contraseña - Glassy</h2>
                <p>Has solicitado restablecer tu contraseña para la empresa <strong>${tenant.name}</strong>.</p>
                <p>Tu código de seguridad es:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: #f1f5f9; color: #1e293b; padding: 15px 30px; border-radius: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border: 1px solid #cbd5e1;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">Introduce este código en la aplicación para continuar. El código expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
            </div>
        `;

        await sendHTMLEmail(tenant.email, `Tu código de seguridad: ${otp} - Glassy`, html);
        res.send({ message: 'Si el correo está registrado, recibirás un código de 6 dígitos.' });

    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).send({ message: 'Error al procesar la solicitud.' });
    }
});

/**
 * RESTABLECER CONTRASEÑA CON OTP
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, companyName, otp, password } = req.body;

        const tenant = await Tenant.findOne({ 
            email: email.toLowerCase().trim(),
            name: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') } 
        });

        if (!tenant) {
            return res.status(404).send({ message: 'Información de empresa no válida.' });
        }

        const user = await User.findOne({
            _id: tenant.ownerId,
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ message: 'Código inválido o expirado. Por favor, solicita uno nuevo.' });
        }

        // Hashear nueva contraseña
        const bcrypt = require('bcryptjs');
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.send({ message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).send({ message: 'Error al restablecer la contraseña.' });
    }
});

module.exports = router;
