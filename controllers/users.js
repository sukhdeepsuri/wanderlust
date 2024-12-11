const User = require('../models/user.js');

module.exports.renderSignupForm = (req, res) => {
  res.render('users/signup.ejs');
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    let newUser = new User({ username, email });

    let registeredUser = await User.register(newUser, password);

    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', `Welcome ${username} to Wanderlust! `);

      req.session.save(err => {
        if (err) {
          return next(new ExpressError(500, 'Session save failed'));
        }
        return res.redirect('/listings');
      });
    });
  } catch (e) {
    req.flash('error', e.message);
    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }
      return res.redirect('/user/signup');
    });
  }
};

module.exports.renderLoginForm = (req, res, next) => {
  res.render('users/login.ejs');
};

module.exports.login = async (req, res) => {
  req.flash('success', 'Welcome back to Wanderlust!');

  req.session.save(err => {
    if (err) {
      return next(new ExpressError(500, 'Session save failed'));
    }
    return res.redirect(res.locals.redirectTo || '/listings');
  });
};

module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You are logged out!');

    req.session.save(err => {
      if (err) {
        return next(new ExpressError(500, 'Session save failed'));
      }
      return res.redirect('/listings');
    });
  });
};
