const mongoose = require('mongoose'); 
const Review = require('./review');
const Schema = mongoose.Schema; 

const ImageSchema = new Schema({
    url: String, 
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const CampGroundSchema = new Schema({
    title: String, 
    images: [ImageSchema],
    // GeoJSON 
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], 
            required: true
        }, 
        coordinates: {
            type: [Number], 
            required: true
        }
    },
    price: Number, 
    description: String, 
    location: String,
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// mongo middleware 
// pre: before sth
// post: after sth 

CampGroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
    console.log("DELETED!!") 
})

module.exports = mongoose.model('Campground', CampGroundSchema);  
