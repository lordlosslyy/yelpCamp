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
const mongoSanitize = require('express-mongo-sanitize');

const LocalStrategy = require('passport-local');
const helmet = require('helmet')

const User = require('./models/user'); 
const Campground = require('./models/campground');
const Review = require('./models/review'); 


const campgroundRoute = require('./routes/campgrounds');
const reviewRoute = require('./routes/reviews');
const userRoute = require('./routes/users');

const MongoStore = require('connect-mongo');

// localhost:27027 is default
// 'mongodb://localhost:27017/yelp-camp'
// const dbUrl = process.env.DB_URL; 
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
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

app.use(mongoSanitize())
// helmet
app.use(helmet())
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/", 
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://cdn.jsdelivr.net/npm/",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duvubltj3/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//  session 

const store = MongoStore.create({
    mongoUrl: dbUrl, 
    secret: 'secret', 
    touchAfter: 24 * 3600
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store, 
    name: 'session',
    secret: 'secret', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // security thing
        HttpOnly: true, 
        // secure:  true
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
    res.render('home'); 
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

