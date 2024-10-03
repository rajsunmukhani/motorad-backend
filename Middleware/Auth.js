const jwt = require('jsonwebtoken');
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncErrors((req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ErrorHandler("Login to Access Resources!", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token

        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid Token", 401));
    }
});
