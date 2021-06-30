const express = require('express'); 
const router = express.Router(); 
const User = require('../models/user'); 
const catchAsync = require('../utils/catchAsync');
const passport = require('passport')


router.get('/register', (req, res) => {
    res.render('users/register'); 
})


router.post('/register', catchAsync(async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const newUser = new User({email, username});
        // passport-local-mongoose built-in function
        const registeredUser = await User.register(newUser, password); 
        // when an user register, we want it automatically login in  
        req.login(registeredUser, err => {
            if (err) return next(err); 
            req.flash('success', 'Welcome to Yelp Camp!'); 
            res.redirect('/campgrounds');  
        })
    } catch (e) {
        req.flash('error', e.message); 
        res.redirect('/register');  
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

// passport built-in passport.authenicate()(req, res) 


router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true }), (req, res) => {
    req.flash('success', 'welcome back'); 
    const redirectUrl = req.session.returnTo || '/campgrounds';  
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
})

router.get('/logout', (req, res) => {
    req.logout(); 
    req.flash('success', 'Logout, Goodbye');
    res.redirect('/campgrounds');
}); 

module.exports = router;