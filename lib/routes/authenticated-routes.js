'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _test = require('../server-controllers/test');

var _test2 = _interopRequireDefault(_test);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Routes in this module require authentication
var router = _express2.default.Router();

// Controls whether this web app will require authentication and authorization.


// Importing the server side modules.
var AUTH_REQUIRED = process.env.AUTH_REQUIRED === 'false';

// middleware that is specific to this router
router.use(function (req, res, next) {
  if (req.isAuthenticated() || !AUTH_REQUIRED) {
    return next();
  }
  return res.redirect('/auth/forcedotcom?redirect=' + req.originalUrl);
});

router.get('/about', function (req, res) {
  _test2.default.test().then(function (data) {
    return res.render('about', {
      title: data
    });
  }).catch(function (e) {
    res.status(500, {
      error: e
    });
  });
});

module.exports = router;
