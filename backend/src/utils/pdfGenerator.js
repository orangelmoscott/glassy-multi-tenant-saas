const PDFDocument = require('pdfkit');

/**
 * Genera un Recibo/Factura profesional para limpieza de cristales.
 * @param {Object} data - Datos de la empresa, cliente y servicio.
 * @returns {Promise<Buffer>}
 */
const generateInvoicePDF = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const { tenant, client, assignment } = data;

        // --- HEADER ---
        if (tenant.logo) {
            try {
                // Convertir Base64 a Buffer si llega como data URL
                const base64Data = tenant.logo.split(',')[1] || tenant.logo;
                doc.image(Buffer.from(base64Data, 'base64'), 50, 45, { width: 80 });
            } catch (e) {
                console.error('Error rendering logo:', e);
            }
        }

        doc.fillColor('#444444')
            .fontSize(20)
            .text(tenant.name || 'Empresa de Limpieza', 150, 50, { align: 'right' })
            .fontSize(10)
            .text(tenant.address || '', 150, 75, { align: 'right' })
            .text(`NIF: ${tenant.nif || ''}`, 150, 90, { align: 'right' })
            .text(`${tenant.email || ''} | ${tenant.phone || ''}`, 150, 105, { align: 'right' })
            .moveDown();

        // --- DIVIDER ---
        doc.moveTo(50, 140).lineTo(550, 140).stroke('#eeeeee');

        // --- CLIENT & INVOICE INFO ---
        doc.fontSize(12).fillColor('#111827').font('Helvetica-Bold').text('CLIENTE:', 50, 160);
        doc.fontSize(10).font('Helvetica').text(client.companyName, 50, 175);
        doc.text(client.address, 50, 190);
        doc.text(`NIF: ${client.nif || 'N/A'}`, 50, 205);

        doc.fontSize(12).font('Helvetica-Bold').text('ORDEN DE SERVICIO:', 400, 160, { align: 'right' });
        doc.fontSize(10).font('Helvetica').text(`Nº: GLASSY-${assignment._id.toString().slice(-6).toUpperCase()}`, 400, 175, { align: 'right' });
        doc.text(`Fecha: ${new Date(assignment.date).toLocaleDateString()}`, 400, 190, { align: 'right' });

        // --- TABLE HEADER ---
        doc.rect(50, 240, 500, 20).fill('#f9fafb').stroke('#eeeeee');
        doc.fontSize(10).fillColor('#374151').font('Helvetica-Bold')
            .text('DESCRIPCIÓN', 60, 245)
            .text('UNID.', 350, 245, { align: 'right' })
            .text('PRECIO UN.', 420, 245, { align: 'right' })
            .text('TOTAL', 500, 245, { align: 'right' });

        // --- TABLE ITEM ---
        doc.fontSize(10).fillColor('#111827').font('Helvetica')
            .text('Servicio de Limpieza de Cristales Especializado', 60, 275)
            .text('1', 350, 275, { align: 'right' })
            .text(`${assignment.price}€`, 420, 275, { align: 'right' })
            .text(`${assignment.price}€`, 500, 275, { align: 'right' });

        // --- SUMMARY ---
        const summaryY = 400;
        doc.rect(350, summaryY, 200, 80).stroke('#eeeeee');
        doc.text('Base Imponible:', 360, summaryY + 15);
        doc.text(`${assignment.price}€`, 540, summaryY + 15, { align: 'right' });
        doc.text('I.V.A (21%):', 360, summaryY + 35);
        doc.text(`${(assignment.price * 0.21).toFixed(2)}€`, 540, summaryY + 35, { align: 'right' });
        
        doc.fontSize(12).font('Helvetica-Bold').text('TOTAL FACTURA:', 360, summaryY + 60);
        doc.text(`${(assignment.price * 1.21).toFixed(2)}€`, 540, summaryY + 60, { align: 'right' });

        // --- FOOTER ---
        doc.fontSize(8).fillColor('#9ca3af')
            .text('Gracias por confiar en nuestros servicios de precisión.', 50, 680, { align: 'center' })
            .font('Helvetica-Bold')
            .text(`FORMA DE PAGO SEGURO: ${tenant.bankDetails || 'Pendiente'}`, 50, 700, { align: 'center' });

        doc.end();
    });
};

module.exports = { generateInvoicePDF };
