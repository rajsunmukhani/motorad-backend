const jwt = require('jsonwebtoken');
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncErrors((req, res, next) => {
    // Access Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ErrorHandler("Login to Access Resources!", 401));
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Verify the token
    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user ID to the request object
        req.id = id;
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid Token", 401));
    }
});
