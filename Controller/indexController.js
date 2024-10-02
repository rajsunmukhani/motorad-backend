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


exports.addCard = catchAsyncErrors(async (req, res) => {
    // console.log(req.body);
    
    try {
      const { cardNumber, expiryDate, cvv, nameOnCard, bankName } = req.body;
  
      // Assuming userId is obtained from authentication middleware
        const userId = req.user.id
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Push the new card to the user's creditCards array
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
        const userId = req.user.id; // Assuming you have user data in req.user after authentication
        const user = await User.findById(userId).populate('creditCards'); // Assuming you have a reference to credit cards in your user schema
                
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send user data along with credit cards
        return res.status(200).json({ user, creditCards: user.creditCards });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// exports.updateCard = catchAsyncErrors(async (req, res) => {
//     const { userId } = req.body; // Get userId from the request body
//     const cardId = req.params.cardId; // Get the cardId from the request parameters

//     try {
//         const user = await userModel.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const cardIndex = user.creditCards.findIndex(card => card._id.toString() === cardId);

//         if (cardIndex === -1) {
//             return res.status(404).json({ message: 'Credit card not found' });
//         }

//         // Update card details
//         user.creditCards[cardIndex] = { ...user.creditCards[cardIndex], ...req.body };
//         await user.save();

//         res.status(200).json({ message: 'Credit card updated successfully', creditCards: user.creditCards });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// })






