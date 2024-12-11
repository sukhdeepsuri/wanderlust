const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash('error', 'You must be logged in to create a listing!');

    // Ensure session is saved before redirecting
    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }
      return res.redirect('/user/login');
    });
    return; // Stops further execution
  }
  next();
};

// module.exports.saveRedirectUrl = (req, res, next) => {
//   if (req.session.redirectUrl) {
//     res.locals.redirectUrl = req.session.redirectUrl;
//   }

//   next();
// };

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash('error', 'You are not the owner of this listing.');

    // Ensure session is saved before redirecting
    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }
      return res.redirect(`/listings/${id}`);
    });
    return; // Stops further execution
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash('error', 'You are not the author of this review.');

    // Ensure session is saved before redirecting
    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }
      return res.redirect(`/listings/${id}`);
    });

    return; // Stops further execution
  }

  next();
};
