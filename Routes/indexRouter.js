const express = require('express');
const { signup, signin } = require('../Controller/indexController');
const router = express();

router.post('/signin', signin );

router.post('/signup', signup );

// router.post('/home',isAuthenticated, );
// router.get('/signout',isAuthenticated );
// router.post('/user',isAuthenticated );


module.exports = router;