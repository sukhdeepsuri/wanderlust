const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../controllers/users.js');

// router.route('commonPath').reqMethodsChaining();
router.route('/signup').get(userController.renderSignupForm).post(wrapAsync(userController.signup));
router
  .route('/login')
  .get(userController.renderLoginForm)
  .post(passport.authenticate('local', { failureRedirect: '/user/login', failureFlash: true }), userController.login);

router.get('/logout', userController.logout);

module.exports = router;
