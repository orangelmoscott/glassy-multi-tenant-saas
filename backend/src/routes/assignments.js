const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Tenant = require('../models/Tenant');
const Client = require('../models/Client');
const Counter = require('../models/Counter');
const { authenticate } = require('../middlewares/auth');
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
        
        const html = `
            <h2>Hola ${assignment.clientId.companyName},</h2>
            <p>Adjuntamos a este correo la factura correspondiente a los servicios prestados recientemente.</p>
            <p>Si tienes alguna duda, puedes responder a este email.</p>
            <br/>
            <p>Atentamente,</p>
            <b>${tenant.name}</b>
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
        const assignments = await Assignment.find({ tenantId: req.user.tenantId })
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
            status: { $ne: 'completado' }
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
 * POST | Crear nueva asignación (Ruta Mensual/Servicio único)
 */
router.post('/', authenticate, async (req, res) => {
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
router.patch('/:id/complete', authenticate, async (req, res) => {
    try {
        const { signature, notes } = req.body;
        
        const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        if (!assignment) return res.status(404).send({ message: 'Ruta no encontrada' });

        assignment.visitsDone = (assignment.visitsDone || 0) + 1;
        assignment.notes = notes || assignment.notes;

        // Si es la última visita esperada, pedimos que se complete la ruta
        if (assignment.visitsDone >= (assignment.expectedVisits || 1)) {
            assignment.status = 'completado';
            assignment.signature = signature;
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
router.patch('/:id/status', authenticate, async (req, res) => {
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

module.exports = router;
