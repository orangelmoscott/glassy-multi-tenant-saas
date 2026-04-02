const Tenant = require('../models/Tenant');
const Worker = require('../models/User'); // Ajustar según el modelo de cristaleros
const Client = require('../models/Client');
const Assignment = require('../models/Assignment');

const PLAN_LIMITS = {
    autonomo: { max_clientes: 40, max_cristaleros: 1, max_rutas_dia: 1 },
    pro: { max_clientes: 150, max_cristaleros: 5, max_rutas_dia: 5 },
    business: { max_clientes: -1, max_cristaleros: -1, max_rutas_dia: -1 }
};

/**
 * Middleware para verificar límites del plan activo.
 * @param {string} resourceType - El tipo de recurso a verificar ('clientes', 'cristaleros', 'rutas_dia')
 */
const checkPlanLimit = (resourceType) => {
    return async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const tenant = await Tenant.findById(tenantId);

            if (!tenant) return res.status(404).json({ message: 'Empresa no encontrada' });

            // Permitir si está activo (pagado) O en periodo de prueba
            const isAllowed = tenant.planActivo === true || 
                              tenant.subscriptionStatus === 'active' || 
                              tenant.subscriptionStatus === 'trial';
                              
            if (!isAllowed) {
                return res.status(403).json({ error: 'SUBSCRIPTION_INACTIVE', message: 'Tu suscripción no está activa.' });
            }

            const planId = tenant.planId || 'autonomo'; // default
            const limits = PLAN_LIMITS[planId];

            if (!limits) {
                return res.status(400).json({ error: 'INVALID_PLAN', message: 'Plan no válido.' });
            }

            const limit = limits[`max_${resourceType}`];

            // -1 significa ilimitado
            if (limit === -1) {
                return next();
            }

            // Contar uso actual del recurso
            let currentCount = 0;
            if (resourceType === 'clientes') {
                currentCount = await Client.countDocuments({ tenantId, isDeleted: false });
            } else if (resourceType === 'cristaleros') {
                currentCount = await Worker.countDocuments({ tenantId, role: 'cristalero', isDeleted: { $ne: true } });
            } else if (resourceType === 'rutas_dia') {
                // Verificar la fecha que se está intentando agendar (si viene en body), sino usar hoy
                const targetDate = req.body.date ? new Date(req.body.date) : new Date();
                if (isNaN(targetDate.getTime())) {
                    return res.status(400).json({ message: 'Fecha inválida solicitada.' });
                }
                const startOfDay = new Date(targetDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(targetDate);
                endOfDay.setHours(23, 59, 59, 999);
                
                // Fetch distinct workerIds operating on this targetDate
                const uniqueWorkers = await Assignment.distinct('workerId', {
                    tenantId,
                    date: { $gte: startOfDay, $lte: endOfDay },
                    isDeleted: { $ne: true }
                });
                
                currentCount = uniqueWorkers.length;
                
                // If creating an assignment, we must check if the requested workerId is already in uniqueWorkers
                // If it IS in uniqueWorkers, then we are just adding clients to an existing 'Ruta', which shouldn't count against limit
                if (req.body.workerId && uniqueWorkers.some(id => id.toString() === req.body.workerId.toString())) {
                    // It's part of an already counted route, so we let it pass.
                    currentCount = Math.max(0, currentCount - 1);
                }
            }

            if (currentCount >= limit) {
                const upgrade_to = planId === 'autonomo' ? 'pro' : 'business';
                return res.status(403).json({
                    error: 'PLAN_LIMIT_REACHED',
                    message: `Has alcanzado el límite de ${resourceType} para tu plan actual.`,
                    upgrade_to
                });
            }

            next();
        } catch (error) {
            console.error('Error en checkPlanLimit:', error);
            res.status(500).json({ message: 'Error interno verificando los límites del plan.' });
        }
    };
};

module.exports = { checkPlanLimit, PLAN_LIMITS };
