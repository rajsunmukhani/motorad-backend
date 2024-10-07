const nodemailer = require('nodemailer');
const ErrorHandler = require('./ErrorHandler');


exports.sendOTPmail = async (email, OTP) => {
    try {
        // Create a transport object using the default SMTP transport
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: process.env.US_MAIL,
                pass: process.env.US_PASS,
            }
        });

        const mailOptions = {
            from: 'Stash', // Update with your email address
            to: email,
            subject: 'Stash Card View OTP',
            html: `<h1>Here is the OTP to view your card details on Stash: <strong>${OTP}</strong></h1>`
        };

        // Send the email
        await transport.sendMail(mailOptions);
        console.log("OTP sent successfully to:", email);

    } catch (err) {
        throw new ErrorHandler(err.message, 500);
    }
};
