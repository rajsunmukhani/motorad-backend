const express = require('express');
const { signup, signin, homepage, googleAuth, googleAuthCallback, saveToken } = require('../Controller/indexController');
const { isAuthenticated } = require('../Middleware/Auth');
const router = express.Router();

router.post('/signup', signup);  
router.post('/signin', signin); 
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback',googleAuthCallback );
router.get('/auth/google/callback',googleAuthCallback );

router.get('/home', isAuthenticated, homepage); 



module.exports = router;
