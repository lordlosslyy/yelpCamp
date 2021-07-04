const User = require('../models/user'); 

module.exports.renderRegister = (req, res) => {
    res.render('users/register'); 
}

module.exports.register = async (req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back'); 
    const redirectUrl = req.session.returnTo || '/campgrounds';  
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
}
 
module.exports.logout = (req, res) => {
    req.logout(); 
    req.flash('success', 'Logout, Goodbye');
    res.redirect('/campgrounds');
}