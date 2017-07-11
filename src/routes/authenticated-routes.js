// Routes in this module require authentication
import express from 'express';

// Importing the server side modules.
import testFile from '../server-controllers/test';

const router = express.Router();

// Controls whether this web app will require authentication and authorization.
const AUTH_REQUIRED = (process.env.AUTH_REQUIRED === 'true');

// middleware that is specific to this router
router.use((req, res, next) => {
  if (req.isAuthenticated() || !AUTH_REQUIRED) {
    return next();
  }
  return res.redirect(`/auth/forcedotcom?redirect=${req.originalUrl}`);
});

router.get('/about', (req, res) => {
  testFile.test().then((data) => {
    return res.render('about', {
      title: data,
    });
  }).catch((e) => {
    res.status(500, {
      error: e,
    });
  });
});


module.exports = router;
