exports.generatedError = (err,req,res,next) => {
    const statusCode = err.statusCode || 500;

    if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
        err.message = 'User Already Exists!'
    }

    res.status(statusCode).json({
        message : err.message,
        errName : err.name,
    });
};