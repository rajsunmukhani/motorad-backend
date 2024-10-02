const express = require('express');
const { signup, signin, homepage, googleAuth, googleAuthCallback, addCard, updateCard, getUser } = require('../Controller/indexController');
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

// router.put('/update-credit-card/:cardId', updateCard);




module.exports = router;
