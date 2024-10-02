const passport = require("../utils/passport-setup");
const { catchAsyncErrors } = require("../Middleware/catchAsyncError");
const User = require("../Model/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendToken } = require("../utils/sendToken");

exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists with the same email
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler('Email already registered', 400));
        }

        // Create new user and save to database
        const user = new User({
            username,
            email,
            password
        });
        await user.save();

        // Send token after successful signup
        sendToken(user, 201, res);

    } catch (error) {
        // Catch any server errors and pass it to your error handler
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

    // Generate token and send to client
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
            return next(err); // Handle the error
        }
        if (!user) {
            return res.redirect('/login'); // Redirect if user not found
        }

        req.logIn(user, async (err) => { 
            if (err) {
                return next(err); // Handle login error
            }
            // Generate the JWT token
            const token = await user.genToken();

            // Redirect to frontend and pass token in query params
            return res.redirect(`http://localhost:5173/home/${token}`);
        });
    })(req, res, next);
});








