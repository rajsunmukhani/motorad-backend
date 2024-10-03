const passport = require("../utils/passport-setup");
const { catchAsyncErrors } = require("../Middleware/catchAsyncError");
const User = require("../Model/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendToken } = require("../utils/sendToken");

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
      const { cardNumber, expiryDate, cvv, nameOnCard, bankName } = req.body;
  
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


// exports.updateCard = catchAsyncErrors(async (req, res) => {
//     const { userId } = req.bo
//     const cardId = req.params.card

//     try {
//         const user = await userModel.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const cardIndex = user.creditCards.findIndex(card => card._id.toString() === cardId);

//         if (cardIndex === -1) {
//             return res.status(404).json({ message: 'Credit card not found' });
//         }

//     
//         user.creditCards[cardIndex] = { ...user.creditCards[cardIndex], ...req.body };
//         await user.save();

//         res.status(200).json({ message: 'Credit card updated successfully', creditCards: user.creditCards });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// })






