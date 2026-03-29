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
        
        const logoHtml = tenant.logo 
            ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${tenant.logo}" alt="${tenant.name}" style="max-height: 80px; max-width: 250px;" /></div>` 
            : `<div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">${tenant.name}</h1></div>`;

        const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #334155; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <div style="padding: 40px;">
                    ${logoHtml}
                    
                    <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; text-align: center; font-weight: 600;">
                        Tu factura ya está disponible
                    </h2>
                    
                    <div style="height: 2px; width: 40px; background-color: #3b82f6; margin: 20px auto 30px;"></div>
                    
                    <p style="font-size: 16px;">Hola <strong>${assignment.clientId.companyName}</strong>,</p>
                    
                    <p style="font-size: 16px; color: #475569;">
                        Queremos agradecerte por confiar en <strong>${tenant.name}</strong>. Adjunta a este correo encontrarás la factura <strong>#${assignment.invoiceNumber}</strong> correspondiente a los servicios prestados recientemente.
                    </p>
                    
                    <p style="font-size: 16px; color: #475569; margin-bottom: 30px;">
                        Nuestro compromiso principal es ofrecerte siempre la máxima calidad. Si tienes alguna duda sobre esta factura o sobre cualquiera de nuestros servicios, puedes responder directamente a este correo; estaremos encantados de ayudarte.
                    </p>

                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px dashed #cbd5e1;">
                        <p style="margin: 0; font-size: 14px; font-weight: 500; color: #64748b;">
                            📄 El documento oficial en formato PDF se encuentra adjunto.
                        </p>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #334155;">Atentamente,</p>
                    <p style="margin: 5px 0 0; font-size: 15px; color: #3b82f6; font-weight: 600;">El equipo de ${tenant.name}</p>
                    ${tenant.website ? `<p style="margin: 15px 0 0;"><a href="${tenant.website}" style="color: #64748b; font-size: 12px; text-decoration: none;">${tenant.website}</a></p>` : ''}
                    <p style="margin: 5px 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 20px;">
                        ESTE ES UN MENSAJE IMPORTANTE
                    </p>
                </div>
            </div>
            <div style="text-align: center; padding-top: 20px;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">Enviado a través de <strong>Glassy</strong> SaaS.</p>
            </div>
        </div>
        `;

        await sendInvoiceEmail(
            assignment.clientId.email, 
            `Factura de Servicios - ${tenant.name}`, 
            html, 
            pdfBuffer, 
            fileName
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
                    text: `${completed}/${expected} este mes`
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


/**
 * POST | Crear nueva asignación (Ruta Mensual/Servicio único)
 */
router.post('/', authenticate, checkTrialStatus, async (req, res) => {
    try {
        const { clientId, date, notes, workerId, price, extraServices } = req.body;
        
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).send({ message: 'Cliente no encontrado' });
        
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
            assignment.visitLogs.push({ signature, date: new Date() });
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
        const { clientId, date, notes, workerId, price, extraServices, status } = req.body;
        
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!assignment) return res.status(404).send({ message: 'Asignación no encontrada' });

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
