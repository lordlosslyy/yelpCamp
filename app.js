if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express'); 
const path = require('path');
const mongoose = require('mongoose'); 
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const morgan = require('morgan');

const passport = require('passport'); 
//
const LocalStrategy = require('passport-local');

const User = require('./models/user'); 
const Campground = require('./models/campground');
const Review = require('./models/review'); 


const campgroundRoute = require('./routes/campgrounds');
const reviewRoute = require('./routes/reviews');
const userRoute = require('./routes/users');

// localhost:27027 is default
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true, 
    useFindAndModify: false,
})


const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
    console.log("Database connected");
});

// 60d99a50a59408dffca64bbc 
const app = express(); 

// forms only send a get or post request from the browser so we can fake a put
// patch, delete and so on using method override 


app.engine('ejs', ejsMate)
// set the view engine, let the express will assume there is the views directory 
app.set('view engine', 'ejs');
// __dirmame will be __dirname: the directory of current file on (app.js) 
app.set('views', path.join(__dirname, 'views')); 


// told the express to parse the request 
app.use(express.urlencoded({extended: true}))  
// use methodOverride 
app.use(methodOverride('_method'))

// serve static file 
app.use(express.static(path.join(__dirname,'public')));

//  
const sessionConfig = {
    secret: 'secret', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // security thing
        HttpOnly: true
    }, 
    
}

app.use(session(sessionConfig)); 
app.use(flash())

// passport: http://www.passportjs.org/docs/downloads/html/ 
app.use(passport.initialize());
app.use(passport.session());  // make sure it is declared after the app.user(session(sessionConfig));
passport.use(new LocalStrategy(User.authenticate()));

// passport local mongoose 
// github: https://github.com/saintedlama/passport-local-mongoose 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());


// use morgan middleware 
// app.use(morgan('tiny'))




// use flash middleware 
app.use((req, res, next) => {
    // req.path is without the router prefix, therefore, we're using originalUrl
    if (!['/login','/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    // req.user is automatically add by passport if login in, if not it is undefined
    res.locals.currentUser = req.user; 
    
    // success is the key
	res.locals.success = req.flash('success');  
    res.locals.error = req.flash('error');
    // middleware needs to call next if u want to continue execute 
    next(); 
})


// use the router in other files 
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);
app.use('/', userRoute);


app.get('/', (req, res) => {
    res.render('HELLO'); 
});


// * equal for every path 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404)); 
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err; 
    if (!err.message) err.message = "Oh, something went wrong"
    res.status(statusCode).render('error', {err}); 
})


app.listen(3000, () => {
    console.log("Serving on port 3000"); 
});

