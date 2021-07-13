const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapBoxToken = process.env.MAPBOX_TOKEN; 
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); 
const ExpressError = require('../utils/ExpressError');
const {cloudinary} = require('../cloudinary'); 


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground); 
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename })); 
    campground.author = req.user._id;
    // store GeoJSON
    campground.geometry = geoData.body.features[0].geometry
    await campground.save();  // wait for saving to database

    req.flash('success', 'Successfully created campground')
    res.redirect(`/campgrounds/${campground._id}`)
    
}

module.exports.showCampground = async (req, res) => {
    // use populate to get the the data of reference id 
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',  
        populate: {
            path: 'author'
        }
    }).populate('author'); 
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    /* I think it is unnecessary 
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    */
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    // ... => spread
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground}) 
    // since we dont't want to pass whole array, we need to spread it 
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }));
    // since we're adding the image. using push     
    campground.images.push(...imgs); 
    await campground.save(); 
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: {images: {filename:{$in: req.body.deleteImages}}}});
    }
    
    req.flash('success', 'Successfully updated campground')
    // ` ${}`
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id); 
    res.redirect('/campgrounds')
}