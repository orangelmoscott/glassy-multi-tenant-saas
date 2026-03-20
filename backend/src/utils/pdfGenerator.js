const PDFDocument = require('pdfkit');

/**
 * Genera un Recibo/Factura profesional para limpieza de cristales.
 * @param {Object} data - Datos de la empresa, cliente y servicio.
 * @returns {Promise<Buffer>}
 */
const generateInvoicePDF = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            info: { Title: 'Factura Glassy Service', Author: 'Glassy SaaS' }
        });
        
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const { tenant, client, assignment } = data;

        // --- HELPER PARA LÍNEAS ---
        const hr = (y) => doc.moveTo(50, y).lineTo(550, y).lineWidth(1).stroke('#F3F4F6');

        // --- HEADER ---
        if (tenant.logo) {
            try {
                const base64Data = tenant.logo.split(',')[1] || tenant.logo;
                doc.image(Buffer.from(base64Data, 'base64'), 50, 45, { width: 60 });
            } catch (e) {
                console.error('Error logo PDF:', e);
            }
        }

        doc.fillColor('#111827').fontSize(16).font('Helvetica-Bold').text(tenant.name || 'Empresa de Limpieza', 200, 45, { align: 'right' });
        doc.fillColor('#6B7280').fontSize(9).font('Helvetica')
           .text(tenant.address || '', 200, 65, { align: 'right' })
           .text(`NIF: ${tenant.nif || ''}`, 200, 78, { align: 'right' })
           .text(`${tenant.email || ''} | ${tenant.phone || ''}`, 200, 91, { align: 'right' });

        hr(120);

        // --- INFO BLOQUES ---
        doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica-Bold').text('CLIENTE', 50, 140);
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(client.companyName, 50, 152);
        doc.fillColor('#4B5563').fontSize(9).font('Helvetica').text(client.address, 50, 168, { width: 250 });
        doc.text(`NIF/CIF: ${client.nif || 'N/A'}`, 50, 185);

        doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica-Bold').text('ORDEN DE SERVICIO', 350, 140, { align: 'right' });
        doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text(`Nº RECIBO: ${assignment._id.toString().slice(-8).toUpperCase()}`, 350, 152, { align: 'right' });
        doc.fillColor('#4B5563').fontSize(9).font('Helvetica').text(`Fecha: ${new Date(assignment.date).toLocaleDateString('es-ES')}`, 350, 168, { align: 'right' });
        doc.text(`Estado: ${assignment.status.toUpperCase()}`, 350, 182, { align: 'right' });

        // --- TABLA DE SERVICIOS ---
        const tableY = 240;
        doc.rect(50, tableY, 500, 25).fill('#F9FAF ForeB').stroke('#F3F4F6');
        doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold')
           .text('DESCRIPCIÓN DEL SERVICIO', 65, tableY + 8)
           .text('CANT.', 350, tableY + 8, { width: 50, align: 'center' })
           .text('PRECIO', 410, tableY + 8, { width: 60, align: 'right' })
           .text('TOTAL', 485, tableY + 8, { width: 60, align: 'right' });

        // Item Row
        const itemY = tableY + 35;
        doc.fillColor('#111827').fontSize(10).font('Helvetica')
           .text('Limpieza de Cristales Profesional y Mantenimiento', 65, itemY)
           .text('1', 350, itemY, { width: 50, align: 'center' })
           .text(`${assignment.price.toFixed(2)}€`, 410, itemY, { width: 60, align: 'right' })
           .text(`${assignment.price.toFixed(2)}€`, 485, itemY, { width: 60, align: 'right' });

        hr(itemY + 25);

        // --- TOTALES ---
        const summaryY = itemY + 60;
        const subtotal = assignment.price;
        const tax = subtotal * 0.21;
        const total = subtotal + tax;

        doc.fillColor('#4B5563').fontSize(10).font('Helvetica').text('Subtotal Base:', 350, summaryY, { align: 'right' });
        doc.fillColor('#111827').text(`${subtotal.toFixed(2)}€`, 545, summaryY, { align: 'right' });

        doc.fillColor('#4B5563').text('IVA (21%):', 350, summaryY + 20, { align: 'right' });
        doc.fillColor('#111827').text(`${tax.toFixed(2)}€`, 545, summaryY + 20, { align: 'right' });

        doc.rect(350, summaryY + 45, 200, 40).fill('#111827');
        doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('TOTAL A PAGAR:', 360, summaryY + 58);
        doc.fontSize(14).text(`${total.toFixed(2)}€`, 540, summaryY + 58, { align: 'right' });

        // --- FIRMA CLIENTE ---
        if (assignment.signature) {
            doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica-Bold').text('VALIDACIÓN DIGITAL (FIRMA CLIENTE)', 50, summaryY + 45);
            try {
                const sigData = assignment.signature.split(',')[1] || assignment.signature;
                doc.image(Buffer.from(sigData, 'base64'), 50, summaryY + 60, { height: 60 });
            } catch (e) {
                doc.text('Firma no disponible visualmente.', 50, summaryY + 60);
            }
        }

        // --- FOOTER ---
        doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica')
           .text(`FORMA DE PAGO: ${tenant.bankDetails || 'Contactar con administración'}`, 50, 720, { align: 'center' })
           .text('Gracias por su confianza. Este documento es un comprobante de servicio profesional.', 50, 735, { align: 'center' });

        doc.end();
    });
};

module.exports = { generateInvoicePDF };
