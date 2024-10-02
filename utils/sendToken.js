exports.sendToken = (student,statusCode,res) => {
    const token = student.genToken();
    const options = {
        expires : new Date(
            Date.now() + process.env.TOKEN_EXPIRY * 24 * 60 * 60 * 1000,
        ),
        httpOnly : true,
        // secured : true
    }
    res.status(statusCode).json({
        success : true,
        id : student._id,
        token
    })
}