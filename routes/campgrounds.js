const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware'); 



// async await
router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', { campgrounds })
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
});

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    
    const campground = new Campground(req.body.campground); 
    campground.author = req.user._id;
    await campground.save();  // wait for saving to database
    req.flash('success', 'Successfully created campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));
// ` ${}`

router.get('/:id', catchAsync(async (req, res) => {
    // use populate to get the the data of reference id 
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',  
        populate: {
            path: 'author'
        }
    }).populate('author'); 
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id); 
    /* I think it is unnecessary 
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    */

    res.render('campgrounds/edit', { campground })
})); 

// it worked from an KTML form, sending a real post request that we are faking as a put request
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req, res) => {
    const {id} = req.params;
    // ... => spread
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground}) 
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// we need to make the button to send the delete request
// which is the post request to this URL, but its going to fake out 
// express make it think it's a delete request because method override 
router.delete('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id); 
    res.redirect('/campgrounds')
})

module.exports = router; 