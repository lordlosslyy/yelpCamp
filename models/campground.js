const mongoose = require('mongoose'); 
const Review = require('./review');
const Schema = mongoose.Schema; 

const CampGroundSchema = new Schema({
    title: String, 
    image: String,
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
