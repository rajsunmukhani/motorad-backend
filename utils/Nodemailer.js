const nodemailer = require('nodemailer');
const ErrorHandler = require('./ErrorHandler');
const otpGenerator = require('otp-generator');
const userModel = require('../Model/User');

exports.sendOTPmail = async (req, res, next) => {
    try {
        // Generate a 6-digit numeric OTP
        const OTP = otpGenerator.generate(6, { 
            digits: true,        
            upperCaseAlphabets: false, 
            specialChars: false,
            lowerCaseAlphabets: false 
        });

        const userId = req.user.id || req.user; // Get user ID from req
        const user = await userModel.findById(userId);

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Set OTP expiration time (e.g., 5 minutes from now)
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save the OTP and expiration time in the user record
        user.otp = OTP;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        // Send the OTP via email
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
            from: 'Stash',
            to: user.email,
            subject: 'Stash Card View OTP',
            html: `<h1>Here is the OTP to view your card details on Stash: <strong>${OTP}</strong></h1>`
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                return next(new ErrorHandler(err, 500));
            }
            res.json({
                message: 'OTP sent to your email address!'
            });
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};
