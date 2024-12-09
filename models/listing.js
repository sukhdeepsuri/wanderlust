const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    url: String,
    filename: String,
  },

  price: Number,

  location: String,

  country: String,

  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },

    coordinates: {
      type: [Number],
      required: true,
    },
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

listingSchema.post('findOneAndDelete', async listing => {
  await Review.deleteMany({ _id: { $in: listing.reviews } });
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;

// Post Middleware :
// 1. Basically, Post middlewares are triggered after an operation is performed on its model.
// 2. We have to attach the middlewares to the model schema.
