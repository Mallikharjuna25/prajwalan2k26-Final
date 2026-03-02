import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendApprovalEmail = async (to, name, role) => {
    try {
        const info = await transporter.sendMail({
            from: `"Event Management System" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your ${role} account has been approved`,
            html: `
        <h2>Hello ${name},</h2>
        <p>Your ${role} account has been successfully approved by the administrator.</p>
        <p>You can now log in to the platform: <a href="${process.env.CLIENT_URL}">Login here</a></p>
        <br>
        <p>Best regards,<br>Event Management Team</p>
      `,
        });
        console.log('Approval email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending approval email:', error);
    }
};

export const sendQRCodeEmail = async (to, name, eventTitle, qrCodeBase64) => {
    try {
        const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, "");

        const info = await transporter.sendMail({
            from: `"Event Management System" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Registration successful - ${eventTitle}`,
            html: `
        <h2>Hello ${name},</h2>
        <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
        <p>Please find your entry QR code attached. Show this QR code at the registration desk for verification.</p>
        <br>
        <p>Best regards,<br>Event Management Team</p>
      `,
            attachments: [
                {
                    filename: 'ticket-qr.png',
                    content: base64Data,
                    encoding: 'base64',
                    cid: 'qrcode'
                }
            ]
        });
        console.log('QR Code email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending QR Code email:', error);
    }
};

export const sendRejectionEmail = async (to, name, role) => {
    try {
        const info = await transporter.sendMail({
            from: `"Event Management System" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Update on your ${role} account application`,
            html: `
        <h2>Hello ${name},</h2>
        <p>We regret to inform you that your application for a ${role} account has been rejected by the administrator.</p>
        <br>
        <p>Best regards,<br>Event Management Team</p>
      `,
        });
        console.log('Rejection email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending rejection email:', error);
    }
};
