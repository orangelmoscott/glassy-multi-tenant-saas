const Tenant = require('../models/Tenant');
const Client = require('../models/Client');

/**
 * SaaS Plan Guard Middleware
 * Verifica que la empresa no haya superado los límites de su suscripción.
 * Reglas:
 * - Starter (SaaS-Free): Máximo 10 clientes.
 * - Basico (29€/mes): Máximo 100 clientes.
 * - Profesional/Empresa: Ilimitado.
 */
async function checkClientLimit(req, res, next) {
    try {
        const tenant = await Tenant.findById(req.user.tenantId);
        if (!tenant) return res.status(404).send({ message: 'Empresa no encontrada' });

        const clientCount = await Client.countDocuments({ 
            tenantId: req.user.tenantId,
            isDeleted: { $ne: true } // No contar clientes eliminados
        });

        const limits = {
            'starter': 10,
            'basico': 100,
            'profesional': Infinity,
            'empresa': Infinity
        };

        const limit = limits[tenant.plan] || 0;

        if (clientCount >= limit) {
            return res.status(403).send({ 
                message: 'Límite de clientes alcanzado', 
                currentPlan: tenant.plan,
                limit: limit,
                upgradeSuggested: true
            });
        }

        next();
    } catch (error) {
        res.status(500).send({ message: 'Error en el guardián de planes del SaaS' });
    }
}

/**
 * Middleware para bloquear funcionalidades exclusivas (ej. Rutas en Plan Básico)
 */
async function requireProfessionalPlan(req, res, next) {
    try {
        const tenant = await Tenant.findById(req.user.tenantId);
        if (['starter', 'basico'].includes(tenant.plan)) {
            return res.status(403).send({ 
                message: 'Funcionalidad exclusiva del Plan Profesional', 
                upgradeSuggested: true 
            });
        }
        next();
    } catch (error) {
        res.status(500).send({ message: 'Error al verificar jerarquía de plan' });
    }
}

async function checkTrialStatus(req, res, next) {
    try {
        const tenant = await Tenant.findById(req.user.tenantId);
        if (!tenant) return res.status(404).send({ message: 'Empresa no encontrada' });

        // Cálculo de días de prueba (7 días máximo según nueva regla profesional)
        const trialDuration = 7 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const created = new Date(tenant.createdAt);
        const diff = now - created;

        if (tenant.plan === 'starter' && diff > trialDuration) {
            return res.status(403).send({ 
                message: 'Tu periodo de prueba de 7 días ha expirado.', 
                trialExpired: true,
                upgradeSuggested: true 
            });
        }
        next();
    } catch (error) {
        res.status(500).send({ message: 'Error al verificar periodo de prueba' });
    }
}

module.exports = { checkClientLimit, requireProfessionalPlan, checkTrialStatus };
