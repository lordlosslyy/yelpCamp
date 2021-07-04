const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const catchAsync = require('../utils/catchAsync');
const passport = require('passport')
const usersController = require('../controllers/users')

router.route('/register')
    .get(usersController.renderRegister)
    .post(catchAsync(usersController.register))

router.route('/login')
    .get(usersController.renderLogin)
    // passport built-in passport.authenicate()(req, res) 
    .post(passport.authenticate('local', {failureRedirect: '/login', failureFlash: true }), usersController.login)

router.get('/logout', usersController.logout); 

module.exports = router;