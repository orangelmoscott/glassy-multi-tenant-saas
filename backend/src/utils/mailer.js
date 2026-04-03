const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendInvoiceEmail = async (to, subject, htmlContent, pdfBuffer, pdfFilename, logoAttachment = null) => {
    try {
        const attachments = [
            {
                filename: pdfFilename,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ];

        if (logoAttachment) {
            attachments.push(logoAttachment);
        }

        await transporter.sendMail({
            from: `"Glassy SaaS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
            attachments
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw error;
    }
};

const sendHTMLEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: `"Glassy SaaS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email HTML:', error);
        throw error;
    }
};

module.exports = { sendInvoiceEmail, sendHTMLEmail };
