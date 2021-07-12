const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({}); // delete everything in database campground
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '60d99a50a59408dffca64bbc',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/duvubltj3/image/upload/v1625238529/YelpCamp/askxokuwkfnkoxq2wlnm.jpg',
                    filename: 'YelpCamp/askxokuwkfnkoxq2wlnm'
                },
                {
                    url: 'https://res.cloudinary.com/duvubltj3/image/upload/v1625238530/YelpCamp/uzcdfgotcjsuu1rzfihn.jpg',
                    filename: 'YelpCamp/uzcdfgotcjsuu1rzfihn'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequuntur vero ratione sunt est voluptatibus natus, sit magni laudantium quos delectus dicta non aliquam minus dolor, minima eos? Dolorem, impedit esse.',
            price, 
            geometry: {
                type: "Point", 
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
