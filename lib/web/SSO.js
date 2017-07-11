'use strict';

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ForceDotComStrategy = require('passport-forcedotcom').Strategy;

/* Gets the enviroment variable from the .env file. If this is set to false then
- the user can access the application with no authetication. */
var AUTH_REQUIRED = process.env.AUTH_REQUIRED;

module.exports = function (app) {
	return {
		/* initialize the user by logging them in through Force */
		init: function init() {
			_passport2.default.serializeUser(function (user, done) {
				done(null, user);
			});

			_passport2.default.deserializeUser(function (obj, done) {
				done(null, obj);
			});

			// Use the ForceDotComStrategy within Passport
			var sfStrategy = new ForceDotComStrategy({
				clientID: process.env.CF_CLIENT_ID,
				clientSecret: process.env.CF_CLIENT_SECRET,
				callbackURL: process.env.CF_CALLBACK_URL,
				authorizationURL: process.env.SF_AUTHORIZE_URL,
				tokenURL: process.env.SF_TOKEN_URL,
				profileFields: ['user_id', 'first_name']
			}, function (accessToken, refreshToken, profile, done) {
				// Only retain the profile properties we need.

				/* This may change */
				profile.user_id = profile.raw.user_id;
				return done(null, profile);
			});

			_passport2.default.use(sfStrategy);

			app.use(_passport2.default.initialize());
			app.use(_passport2.default.session());
		},


		/* This function includes all the needed routes for authetication.*/
		registerRoutes: function registerRoutes() {
			app.get('/auth/forcedotcom', function (req, res, next) {
				if (req.query.redirect) {
					req.session.authRedirect = req.query.redirect;
				}
				_passport2.default.authenticate('forcedotcom')(req, res, next);
			});

			/* Callback route for when the data comes back from the '/auth/forcedotcom Route' */
			app.get('/auth/forcedotcom/callback', _passport2.default.authenticate('forcedotcom', {
				failureRedirect: '/error'
			}), function (req, res) {
				var redirect = req.session.authRedirect;
				if (redirect) {
					delete req.session.authRedirect;
				}
				res.redirect(303, redirect || '/');
			});

			/* If there is no authentication then it automatically goes to the index page
   - if autheication is set to true it then goes through the method of trying to
   - autheticate */
			app.get('/', function (req, res) {
				if (!req.user && AUTH_REQUIRED === 'true') {
					if (req.session) {
						req.session.destroy();
						req.logout();
					}
					return res.redirect('/auth/forcedotcom');
				}
				return res.render('index');
			});

			/* Route for when the user logs out.*/
			app.get('/logout', function (req, res) {
				req.logout();
				req.session.destroy();
				return res.render('logout');
			});
		},


		/* This is a function to check and make sure the user is authetnicated. If in the
  - .env AUTH is set to false it skips and carrys on. If AUTH is set to true it runs
  - and make sure the user is autheicated. */
		ensureAuthenticated: function ensureAuthenticated(req, res, next) {
			if (req.isAuthenticated() || !AUTH_REQUIRED) {
				return next();
			}
			return res.redirect('/auth/forcedotcom?redirect=' + req.originalUrl);
		}
	};
};