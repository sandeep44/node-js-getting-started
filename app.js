
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const authenticatedRoutes = require('./lib/routes/authenticated-routes');

const app = express();

if (app.get('env') === 'development') {
  /* eslint-disable global-require */
  require('dotenv').config();
}

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Configure the express app
app.use(logger(process.env.LOG_LEVEL));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

// Configure the session middleware
require('./lib/web/sessions')(app);

// Configure authentication middleware
const auth = require('./lib/web/auth')(app);

auth.init();
auth.registerRoutes();

// compress all routes
app.use(compression());

// view engine setup and public static directory
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'lib/public')));

// Load authenticated routes
app.use('/', authenticatedRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// development error handler will print stck trace
// To run in development mode set config var NODE_ENV to 'development'
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler. No stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
