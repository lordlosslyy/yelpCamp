const express = require('express'); 
const path = require('path');
const mongoose = require('mongoose'); 
const methodOverride = require('method-override');

const Campground = require('./models/campground');

// localhost:27027 is default
mongoose.connect('mongodb://localhost:27017/yelp-camp')

const app = express(); 

// forms only send a get or post request from the browser so we can fake a put
// patch, delete and so on using method override 


// set the view engine, let the express will assume there is the views directory 
app.set('view engine', 'ejs');
// __dirmame will be __dirname: the directory of current file on (app.js) 
app.set('views', path.join(__dirname, 'views')); 

// told the express to parse the request 
app.use(express.urlencoded({extended: true}))  
app.use(methodOverride('_method'))

const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
    console.log("Database connected");
});

app.get('/', (req, res) => {
    res.render('HELLO'); 
});

// async await
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', { campgrounds })
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground); 
    await campground.save();  // wait for saving to database
    res.redirect(`/campgrounds/${campground._id}`)
});
// ` ${}`

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id) 
    res.render('campgrounds/show', { campground })
});

app.get('/campgrounds/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id) 
    res.render('campgrounds/edit', { campground })
}); 

// it worked from an KTML form, sending a real post request that we are faking as a put request
app.put('/campgrounds/:id', async(req, res) => {
    const {id} = req.params;
    // ... => spread
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground}) 
    res.redirect(`/campgrounds/${campground._id}`)
})

// we need to make the button to send the delete request
// which is the post request to this URL, but its going to fake out 
// express make it think it's a delete request because method override 
app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id); 
    res.redirect('/campgrounds')
})

app.listen(3000, () => {
    console.log("Serving on port 3000"); 
});

