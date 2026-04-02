const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Tenant = require('../models/Tenant');
const Client = require('../models/Client');
const Counter = require('../models/Counter');
const { authenticate } = require('../middlewares/auth');
const { checkTrialStatus } = require('../middlewares/planGuard');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

/**
 * GET | Generar Factura PDF del Servicio
 */
router.get('/:id/invoice', authenticate, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('clientId');
        
        if (!assignment) return res.status(404).send({ message: 'Ruta no encontrada' });

        const tenant = await Tenant.findById(req.user.tenantId);
        
        // Asignar número de factura si no tiene
        if (!assignment.invoiceNumber) {
            const counter = await Counter.findOneAndUpdate(
                { id: `invoice_${req.user.tenantId}`, tenantId: req.user.tenantId },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            // Numeración ej. 001, 002...
            assignment.invoiceNumber = String(counter.seq).padStart(3, '0');
            await assignment.save();
        }

        // Generar PDF con los datos reales
        const pdfBuffer = await generateInvoicePDF({
            tenant: tenant,
            client: assignment.clientId,
            assignment: assignment
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Factura_Glassy_${assignment._id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al generar la factura' });
    }
});

/**
 * POST | Enviar Factura por Email al Cliente
 */
router.post('/:id/send-invoice', authenticate, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate('clientId');
        
        if (!assignment) return res.status(404).send({ message: 'Ruta no encontrada' });
        if (!assignment.clientId?.email) return res.status(400).send({ message: 'El cliente no tiene un email registrado.' });

        const tenant = await Tenant.findById(req.user.tenantId);
        
        if (!assignment.invoiceNumber) {
            const counter = await Counter.findOneAndUpdate(
                { id: `invoice_${req.user.tenantId}`, tenantId: req.user.tenantId },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            assignment.invoiceNumber = String(counter.seq).padStart(3, '0');
            await assignment.save();
        }

        const pdfBuffer = await generateInvoicePDF({
            tenant: tenant,
            client: assignment.clientId,
            assignment: assignment
        });

        const { sendInvoiceEmail } = require('../utils/mailer');
        const fileName = `Factura_${tenant.name.replace(/\s+/g, '_')}_${assignment.invoiceNumber}.pdf`;
        
        let logoHtml = `<h1 style="color: #111827; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">${tenant.name}</h1>`;
        let logoAttachment = null;
        
        if (tenant.logo && typeof tenant.logo === 'string') {
            if (tenant.logo.startsWith('data:image')) {
                const prefixMatch = tenant.logo.match(/^data:(image\/\w+);base64,/);
                if (prefixMatch) {
                    const contentType = prefixMatch[1];
                    const base64Data = tenant.logo.slice(prefixMatch[0].length);
                    const ext = contentType.split('/')[1] || 'png';
                    
                    logoAttachment = {
                        filename: `logo.${ext}`,
                        content: Buffer.from(base64Data, 'base64'),
                        cid: 'companyLogo'
                    };
                    logoHtml = `<img src="cid:companyLogo" alt="${tenant.name}" style="max-height: 80px; max-width: 250px; display: block; margin: 0 auto; border: none; outline: none;" />`;
                }
            } else if (tenant.logo.startsWith('http')) {
                logoHtml = `<img src="${tenant.logo}" alt="${tenant.name}" style="max-height: 80px; max-width: 250px; display: block; margin: 0 auto; border: none; outline: none;" />`;
            }
        }

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; width: 100%; margin: 0; padding: 40px 0;">
        <tr><td align="center">
            <!-- Main Card -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); overflow: hidden;">
                <!-- Header / Logo -->
                <tr><td align="center" style="padding: 50px 40px 10px 40px;">
                    ${logoHtml}
                </td></tr>
                
                <!-- Title -->
                <tr><td align="center" style="padding: 10px 40px 20px 40px;">
                    <div style="width: 30px; height: 3px; background-color: #2563eb; margin: 0 auto 20px auto; border-radius: 2px;"></div>
                    <h2 style="margin: 0; font-size: 20px; color: #111827; font-weight: 600; letter-spacing: -0.02em;">Tu Factura de Servicios</h2>
                </td></tr>
                
                <!-- Body Text -->
                <tr><td style="padding: 10px 40px 30px 40px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Hola <strong>${assignment.clientId.companyName}</strong>,
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                        Ha sido un placer trabajar para ti. Adjunto a este correo electrónico encontrarás la factura <strong>#${assignment.invoiceNumber}</strong> por nuestros servicios recientes.
                    </p>
                    <p style="margin: 0 0 25px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                        Queremos expresar nuestro más sincero agradecimiento por seguir confiando en <strong>${tenant.name}</strong>. Nos esforzamos día a día para brindarte los mejores resultados y el mejor trato posible. Cualquier duda que tengas, simplemente responde a este correo.
                    </p>
                    
                    <!-- Callout Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                        <tr><td align="center" style="padding: 20px;">
                            <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 500;">
                                <span style="font-size: 18px; vertical-align: middle;">📄</span> El documento oficial en formato PDF está adjunto.
                            </p>
                        </td></tr>
                    </table>
                </td></tr>
                
                <!-- Footer within Card -->
                <tr><td align="center" style="padding: 30px 40px 40px 40px; background-color: #fafafa; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Atentamente,</p>
                    <p style="margin: 6px 0 0; font-size: 16px; font-weight: 700; color: #111827;">El equipo de ${tenant.name}</p>
                    ${tenant.website ? `<p style="margin: 12px 0 0;"><a href="${tenant.website}" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500;">Visitar nuestro sitio web</a></p>` : ''}
                </td></tr>
            </table>
            
            <!-- Glassy Footer Branding -->
            <table width="600" cellpadding="0" cellspacing="0" border="0">
                <tr><td align="center" style="padding: 25px 0;">
                    <p style="margin: 0; font-size: 12px; color: #aaa;">
                        Procesado y enviado de forma segura vía <strong>Glassy SaaS</strong>
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;

        await sendInvoiceEmail(
            assignment.clientId.email, 
            `Factura de Servicios - ${tenant.name}`, 
            html, 
            pdfBuffer, 
            fileName,
            logoAttachment
        );

        res.send({ message: 'Factura enviada al email del cliente exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al enviar la factura por email.' });
    }
});
router.get('/', authenticate, async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            tenantId: req.user.tenantId,
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: { $ne: true } }
            ]
        })
            .populate('clientId', 'companyName address phone serviceType')
            .populate('workerId', 'fullName username')
            .sort({ date: -1 });
        res.send(assignments);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener asignaciones' });
    }
});

/**
 * GET | Sus propias asignaciones (Acceso para Cristaleros)
 */
router.get('/my', authenticate, async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            tenantId: req.user.tenantId, 
            workerId: req.user.userId,
            status: { $ne: 'completado' },
            isDeleted: false
        })
        .populate('clientId')
        .sort({ date: 1 })
        .lean();

        const enhanced = assignments.map(a => {
            const completed = a.visitsDone || 0;
            const expected = a.expectedVisits || 1;

            return {
                ...a,
                progressInfo: {
                    completed,
                    expected,
                    text: `${completed}/${expected} visitas`
                }
            };
        });

        res.send(enhanced);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener tus asignaciones' });
    }
});

/**
 * GET | Historial de asignaciones completadas (Acceso para Cristaleros)
 */
router.get('/my-history', authenticate, async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            tenantId: req.user.tenantId, 
            workerId: req.user.userId,
            status: 'completado',
            isDeleted: false
        })
        .populate('clientId', 'companyName address phone')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

        res.send(assignments);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener tu historial' });
    }
});


const { checkPlanLimit } = require('../middlewares/checkPlan');

const findConflict = async (clientId, dateStr, tenantId, excludeId = null) => {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const query = {
        clientId,
        tenantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: { $ne: true }
    };
    if (excludeId) query._id = { $ne: excludeId };

    return await Assignment.findOne(query).populate('workerId', 'fullName username');
};

/**
 * POST | Crear nueva asignación (Ruta Mensual/Servicio único)
 */
router.post('/', authenticate, checkTrialStatus, checkPlanLimit('rutas_dia'), async (req, res) => {
    try {
        const { clientId, date, notes, workerId, price, extraServices, forceReassign } = req.body;
        
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).send({ message: 'Cliente no encontrado' });
        
        const conflict = await findConflict(clientId, date || new Date(), req.user.tenantId);
        if (conflict) {
            if (!forceReassign) {
                return res.status(409).json({
                    error: 'CLIENT_ALREADY_ASSIGNED',
                    message: `Este servicio ya está asignado a ${conflict.workerId?.fullName || conflict.workerId?.username} en esta misma fecha. ¿Deseas hacer el cambio y reasignarlo a este nuevo cristalero?`,
                    conflictId: conflict._id,
                    workerName: conflict.workerId?.fullName || conflict.workerId?.username
                });
            } else {
                conflict.workerId = workerId;
                if (price !== undefined) conflict.price = price;
                if (notes !== undefined) conflict.notes = notes;
                if (extraServices) conflict.extraServices = extraServices;
                await conflict.save();
                const populated = await Assignment.findById(conflict._id).populate([
                    { path: 'clientId', select: 'companyName address' },
                    { path: 'workerId', select: 'fullName username' }
                ]);
                return res.status(200).send(populated);
            }
        }

        let expectedVisits = 1;
        if (client.frequency === 'semanal') expectedVisits = 4;
        if (client.frequency === 'quincenal') expectedVisits = 2;

        const newAssignment = new Assignment({
            tenantId: req.user.tenantId,
            userId: req.user.userId,
            clientId,
            date: date || new Date(),
            notes,
            workerId,
            price: price || 0,
            expectedVisits,
            visitsDone: 0,
            extraServices: extraServices || [],
            createdBy: req.user.userId
        });

        await newAssignment.save();
        const populated = await Assignment.findById(newAssignment._id).populate([
            { path: 'clientId', select: 'companyName address' },
            { path: 'workerId', select: 'fullName username' }
        ]);
        res.status(201).send(populated);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al crear la asignación' });
    }
});

/**
 * PATCH | Completar Trabajo o Registrar Visita Parcial
 */
router.patch('/:id/complete', authenticate, checkTrialStatus, async (req, res) => {
    try {
        const { signature, notes, extraServices } = req.body;
        
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!assignment) return res.status(404).send({ message: 'Ruta no encontrada' });

        assignment.visitsDone = (assignment.visitsDone || 0) + 1;
        assignment.notes = notes || assignment.notes;

        // Añadir servicios extra si el operario los reportó en el momento
        if (extraServices && Array.isArray(extraServices)) {
            extraServices.forEach(service => {
                if (service.description && service.price) {
                    assignment.extraServices.push({
                        description: service.description,
                        price: parseFloat(service.price)
                    });
                }
            });
        }
        
        if (signature) {
            assignment.visitLogs.push({ 
                signature, 
                date: new Date(),
                workerId: req.user.userId,
                workerName: req.user.fullName || req.user.username // Por si no hay fullName
            });
        }

        // Si es la última visita esperada, pedimos que se complete la ruta
        if (assignment.visitsDone >= (assignment.expectedVisits || 1)) {
            assignment.status = 'completado';
            assignment.signature = signature; // Firma principal de la asignación
            assignment.completedAt = new Date();
        } else {
            // Si no, cambiamos a en_ruta para indicar que ya empezó sus ciclos
            assignment.status = 'en_ruta';
        }

        await assignment.save();
        res.send({ message: 'Progreso guardado con éxito', assignment });
    } catch (error) {
        res.status(500).send({ message: 'Error al validar servicio' });
    }
});

/**
 * PATCH | Actualizar estado
 */
router.patch('/:id/status', authenticate, checkTrialStatus, async (req, res) => {
    try {
        const { status } = req.body;
        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user.tenantId },
            { status },
            { new: true }
        );
        res.send(assignment);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar estado' });
    }
});

/**
 * PUT | Actualizar Asignación (Admin)
 */
router.put('/:id', authenticate, checkTrialStatus, async (req, res) => {
    try {
        const { clientId, date, notes, workerId, price, extraServices, status, forceReassign } = req.body;
        
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!assignment) return res.status(404).send({ message: 'Asignación no encontrada' });

        const conflict = await findConflict(clientId || assignment.clientId, date || assignment.date, req.user.tenantId, req.params.id);
        if (conflict) {
            if (!forceReassign) {
                return res.status(409).json({
                    error: 'CLIENT_ALREADY_ASSIGNED',
                    message: `Este servicio ya está asignado a ${conflict.workerId?.fullName || conflict.workerId?.username} en esta misma fecha. ¿Deseas hacer el cambio y sobreescribir dicha asignación por la tuya actual?`,
                    conflictId: conflict._id,
                    workerName: conflict.workerId?.fullName || conflict.workerId?.username
                });
            } else {
                // If forceReassign is true, we delete the conflict because we're moving this current assignment 'over' it.
                await Assignment.deleteOne({ _id: conflict._id });
            }
        }
        
        // --- Enforce Plan Limits on Update ---
        const targetDateStr = date || assignment.date;
        const targetWorkerId = workerId || assignment.workerId;
        
        // Only check limits if bringing assignment to a new worker or a new day
        if (workerId?.toString() !== assignment.workerId?.toString() || new Date(date || 0).getTime() !== new Date(assignment.date || 0).getTime()) {
            const Tenant = require('../models/Tenant');
            const { PLAN_LIMITS } = require('../middlewares/checkPlan');
            
            const tenant = await Tenant.findById(req.user.tenantId);
            const planId = tenant.planId || 'autonomo';
            const limits = PLAN_LIMITS[planId];
            
            if (limits && limits.max_rutas_dia !== -1) {
                const targetDate = new Date(targetDateStr);
                const startOfDay = new Date(targetDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(targetDate);
                endOfDay.setHours(23, 59, 59, 999);
                
                const uniqueWorkers = await Assignment.distinct('workerId', {
                    tenantId: req.user.tenantId,
                    date: { $gte: startOfDay, $lte: endOfDay },
                    isDeleted: { $ne: true },
                    _id: { $ne: req.params.id } // Exclude this assignment
                });
                
                let currentCount = uniqueWorkers.length;
                if (!uniqueWorkers.some(id => id.toString() === targetWorkerId.toString())) {
                    currentCount += 1;
                }
                
                if (currentCount > limits.max_rutas_dia) {
                    const upgrade_to = planId === 'autonomo' ? 'pro' : 'business';
                    return res.status(403).json({
                        error: 'PLAN_LIMIT_REACHED',
                        message: `No puedes asignar esto a un nuevo cristalero. Has alcanzado el límite de rutas diarias (rutas_dia) para tu plan actual.`,
                        upgrade_to
                    });
                }
            }
        }
        // --- End of Plan Limits Update Check ---

        // Update fields if provided
        if (clientId) assignment.clientId = clientId;
        if (date) assignment.date = date;
        if (notes !== undefined) assignment.notes = notes;
        if (workerId !== undefined) assignment.workerId = workerId;
        if (price !== undefined) assignment.price = price;
        if (extraServices) assignment.extraServices = extraServices;
        if (status) assignment.status = status;

        await assignment.save();
        const updated = await Assignment.findById(assignment._id).populate([
            { path: 'clientId', select: 'companyName address' },
            { path: 'workerId', select: 'fullName username' }
        ]);
        res.send(updated);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar asignación' });
    }
});

/**
 * DELETE | Eliminar Asignación (Soft delete if billed)
 */
router.delete('/:id', authenticate, checkTrialStatus, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!assignment) return res.status(404).send({ message: 'Asignación no encontrada' });

        // If it was already billed (has invoiceNumber), we soft-delete it to preserve history
        if (assignment.invoiceNumber) {
            assignment.status = 'cancelado';
            assignment.isDeleted = true;
            await assignment.save();
            return res.send({ message: 'Asignación facturada archivada/cancelada para historial.' });
        }

        // Otherwise, hard delete
        await Assignment.deleteOne({ _id: req.params.id });
        res.send({ message: 'Asignación eliminada correctamente.' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).send({ message: 'Error al eliminar asignación', error: error.message });
    }
});

module.exports = router;
