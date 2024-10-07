const passport = require("../utils/passport-setup");
const { catchAsyncErrors } = require("../Middleware/catchAsyncError");
const User = require("../Model/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendToken } = require("../utils/sendToken");
const { sendOTPmail } = require("../utils/Nodemailer");

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

      
      
      const userId = req.user.id
      
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
        const user = await User.findById(userId).populate('creditCards')
                
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user, creditCards: user.creditCards });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

exports.sendOTP = catchAsyncErrors(async (req,res,next) => {
    try {
       sendOTPmail(req,res,next);
    } catch (error) {
        console.log(error);
    }
});

exports.verifyOTP = async (req, res, next) => {
    try {
        const { otp } = req.body; // OTP from frontend
        const userId = req.user.id || req.user;

        const user = await userModel.findById(userId);
        console.log({
            user,
            otp
        });
        

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Check if OTP matches and is not expired
        if (user.otp === otp && user.otpExpiresAt > Date.now()) {
            // OTP is valid
            res.status(200).json({ 
                success : true
            });
        } else {
            // OTP is invalid or expired
            return next(new ErrorHandler('Invalid or expired OTP', 400));
        }
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};







