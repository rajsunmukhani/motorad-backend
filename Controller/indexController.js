const passport = require("../utils/passport-setup");
const { catchAsyncErrors } = require("../Middleware/catchAsyncError");
const User = require("../Model/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendToken } = require("../utils/sendToken");
const { sendOTPmail } = require("../utils/Nodemailer");
const otpGenerator = require('otp-generator')
const crypto = require('crypto'); // To generate random OTP

exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler('Email already registered', 400));
        }

        const user = new User({
            username,
            email,
            password
        });
        await user.save();

        sendToken(user, 201, res);

    } catch (error) {
        next(error);
    }
};

exports.signin = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findOne({ username: req.body.username }).select('+password');
    if (!user) {
        return next(new ErrorHandler('User Not Found', 404));
    }

    const isMatch = user.comparePasswords(req.body.password);
    if (!isMatch) {
        return next(new ErrorHandler('Wrong Credentials', 400));
    }
    sendToken(user, 200, res);
});

exports.homepage = catchAsyncErrors(async(Req,res,next) => {
    res.json({
        message : 'hello from homepage'
    })
});

exports.googleAuth = catchAsyncErrors(async(req,res,next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req,res,next);
});

exports.googleAuthCallback = catchAsyncErrors((req, res, next) => {
    passport.authenticate('google', { 
        failureRedirect: '/login' 
    }, async (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.redirect('/login')
        }

        req.logIn(user, async (err) => { 
            if (err) {
                return next(err)
            }

            const token = await user.genToken();
            return res.redirect(`http://localhost:5173/home/${token}`);
        });
    })(req, res, next);
});

exports.addCard = catchAsyncErrors(async (req, res) => {
    try {
      const { cardNumber, expiryDate, cvv, nameOnCard, bankName, limit, usedAmount } = req.body;

      const userId = req.user.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.creditCards.push({
        cardNumber,
        expiryDate,
        cvv,
        nameOnCard,
        bankName,
        limit,
        usedAmount
      });
  
      await user.save();
      
      return res.status(201).json({ message: 'Card added successfully', card: user.creditCards[user.creditCards.length - 1] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
    }
});

exports.getUser = catchAsyncErrors(async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('creditCards');
                
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user, creditCards: user.creditCards });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Generate and send OTP to the user's email
exports.sendOTP = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.user; // Get email from the request body

        const user = await User.findById( id );
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Generate a random 6-digit OTP
        const otp = otpGenerator.generate(6, { 
            digits: true,        
            upperCaseAlphabets: false, 
            specialChars: false,
            lowerCaseAlphabets: false 
        });

        // Set expiration time (5 minutes)
        user.otp = otp;
        user.otpExpiresAt = Date.now() + 300000; // 5 minutes

        await user.save(); // Save OTP and expiration time to user

        // Send OTP email
        await sendOTPmail(user.email, otp);
        res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return next(new ErrorHandler('Error sending OTP', 500));
    }
});


// Verify the OTP
exports.verifyOTP = catchAsyncErrors(async (req, res, next) => {
    try {
        const { otp } = req.body; // OTP from frontend
        const userId = req.user.id || req.user;

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Check if OTP matches and is not expired
        if (user.otp === otp && user.otpExpiresAt > Date.now()) {
            // OTP is valid
            user.otp = undefined; // Clear the OTP after verification
            user.otpExpiresAt = undefined; // Clear the expiration time
            await user.save(); // Save the changes

            return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
        } else {
            // OTP is invalid or expired
            return next(new ErrorHandler('Invalid or expired OTP', 400));
        }
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});
