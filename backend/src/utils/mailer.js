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

const sendInvoiceEmail = async (to, subject, htmlContent, pdfBuffer, pdfFilename) => {
    try {
        await transporter.sendMail({
            from: `"Gestión SaaS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
            attachments: [
                {
                    filename: pdfFilename,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw error;
    }
};

module.exports = { sendInvoiceEmail };
