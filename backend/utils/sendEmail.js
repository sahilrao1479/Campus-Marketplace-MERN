import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // This will reject if credentials are bad, preventing timeouts when trying to send
        await transporter.verify();

        const message = {
            from: `${process.env.FROM_NAME || 'Campus Thrift'} <${process.env.FROM_EMAIL || 'test@example.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        console.log('\n--- EMAIL SENT ---');
        console.log('Message sent: %s', info.messageId);
        console.log('------------------\n');
    } catch (err) {
        console.log('\n=============================================');
        console.log('!!! SMTP FAILED - MOCKING EMAIL DELIVERY !!!');
        console.log('To:', options.email);
        console.log('Subject:', options.subject);
        console.log('Content:\n', options.message);
        console.log('=============================================\n');
    }
};

export default sendEmail;
