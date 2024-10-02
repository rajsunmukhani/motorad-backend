require('dotenv').config('./.env');
const express = require('express');
const app = express();

//logger
const logger = require('morgan');
app.use(logger('tiny'));

//cookie-parser & express-session & passport
const passport = require('passport');
const session = require('express-session');
const cookieparser = require('cookie-parser');

app.use(passport.initialize());
app.use(session({
    resave : true,
    saveUninitialized : true,
    secret : process.env.SESSION_SECRET,
    cookie: {
        secure: false, // Use `true` when in production and using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day cookie expiration
    }
}))
app.use(cookieparser());

// //express fileupload
// const upload = require('express-fileupload');
// app.use(upload());

//body parser
app.use(express.json());
app.use(express.urlencoded({extended : false}));

// CORS
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials : true,
}));

//routes
app.use('/', require('./Routes/indexRouter'))

//error handler
const ErrorHandler = require('./utils/ErrorHandler');
const { generatedError } = require('./Middleware/Error');
app.all('*',(req,res,next)=> {
    next(new ErrorHandler(`Requested URL Not Found!`, 404));
});
app.use(generatedError);

//db connection
require('./Model/Database').connectDatabase();

app.listen(process.env.PORT,console.log(`server is running on Port : ${process.env.PORT}`));