const express = require('express');
// mergeParams make this file have the access for the :id in '/campgrounds/:id/reviews'
const router = express.Router({mergeParams: true}); 

const {reviewSchema} = require('../schemas.js')
const Campground = require('../models/campground');
const Review = require('../models/review'); 
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware'); 

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


// validateReview middleware use Joi to validate the review input 
// catchAsync catch async error from server  
router.post('/', validateReview, isLoggedIn, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id); 
    const review = new Review(req.body.review);
    review.author = req.user._id; 
    campground.reviews.push(review);
    
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res, ) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;