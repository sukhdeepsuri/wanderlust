const Listing = require('../models/listing.js');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash('success', 'Review Added Successfully');

  req.session.save(err => {
    if (err) {
      return next(new ExpressError(500, 'Session save failed'));
    }
    return res.redirect(`/listings/${listing._id}`);
  });
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review Deleted Successfully');

  req.session.save(err => {
    if (err) {
      return next(new ExpressError(500, 'Session save failed'));
    }
    return res.redirect(`/listings/${id}`);
  });
};
