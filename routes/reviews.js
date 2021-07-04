const express = require('express');
// mergeParams make this file have the access for the :id in '/campgrounds/:id/reviews'
const router = express.Router({mergeParams: true}); 
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware'); 
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews')

// validateReview middleware use Joi to validate the review input 
// catchAsync catch async error from server  
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;