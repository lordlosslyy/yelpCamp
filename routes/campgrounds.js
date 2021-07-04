const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware'); 
const campgrounds = require('../controllers/campgrounds.js');

const multer = require('multer'); 
const {storage} = require('../cloudinary'); 
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))



router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    // it worked from an KTML form, sending a real post request that we are faking as a put request
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // we need to make the button to send the delete request
    // which is the post request to this URL, but its going to fake out 
    // express make it think it's a delete request because method override 
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); 

module.exports = router; 