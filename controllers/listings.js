const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('owner');

  if (!listing) {
    req.flash('error', 'Listing you requested for does not exist.');

    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }

      return res.redirect('/listings');
    });
  } else {
    res.render('listings/show.ejs', { listing });
  }
};

module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url: url,
    filename: filename,
  };

  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();
  req.flash('success', 'New Listing Created');

  req.session.save(err => {
    if (err) {
      return next(new ExpressError(500, 'Session save failed'));
    }
    return res.redirect('/listings');
  });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash('error', 'Listing you requested for does not exist.');
    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }
      return res.redirect('/listings');
    });
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250');
    res.render('listings/edit.ejs', { listing, originalImageUrl });
  }
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, req.body.listing);

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {
      url: url,
      filename: filename,
    };
    await listing.save();
  }

  req.flash('success', 'Listing Updated Successfully');
  req.session.save(err => {
    if (err) {
      return next(new ExpressError(500, 'Session save failed'));
    }
    return res.redirect(`/listings/${id}`);
  });
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing Deleted Successfully');

  req.session.save(err => {
    if (err) {
      return next(new ExpressError(500, 'Session save failed'));
    }
    return res.redirect('/listings');
  });
};
