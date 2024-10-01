const { catchAsyncErrors } = require("../Middleware/catchAsyncError");
const User = require("../Model/User");
const ErrorHandler = require("../utils/ErrorHandler");

exports.signup =async(req,res,next) => {
    const student = await new User(req.body).save();
    // sendToken(student,200,res);

    res.json({
        success : true
    })
};

exports.signin = catchAsyncErrors(async(req,res,next) => {
    const student = await User.findOne({username : req.body.username}).select('+password').exec();
    if (!student) {
        return next(new ErrorHandler('User Not Found', 404))
    }

    const isMatch = student.comparePasswords(req.body.password);
    if (!isMatch) {
        return next(new ErrorHandler('Wrong Credentials', 500));
    }

    res.json({
        success : true,
    })
    // sendToken(student,201,res);
});