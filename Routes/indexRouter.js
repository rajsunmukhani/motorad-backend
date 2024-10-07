const express = require('express');
const { signup, signin, homepage, googleAuth, googleAuthCallback, addCard, updateCard, getUser, sendOTP, verifyOTP } = require('../Controller/indexController');
const { isAuthenticated } = require('../Middleware/Auth');
const router = express.Router();

router.post('/signup', signup);  
router.post('/signin', signin); 
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback',googleAuthCallback );
router.get('/auth/google/callback',googleAuthCallback );
router.get('/home', isAuthenticated, homepage); 

router.post('/add-card', isAuthenticated ,addCard);
router.get('/user/:token', isAuthenticated, getUser); 

router.post('/send-otp', isAuthenticated ,sendOTP);

router.post('/verify-otp', isAuthenticated ,verifyOTP);




module.exports = router;
