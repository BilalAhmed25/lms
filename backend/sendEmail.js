const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sendEmail(from, to, subject, emailBody, attachments = [], configuration) {
    const config = configuration || {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };
    
    const transporter = nodemailer.createTransport(config);
    const mailOptions = {
        from,
        to,
        subject,
        html: emailBody || "<p>Internal server error.</p>",
        priority: 'high',
        attachments,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
