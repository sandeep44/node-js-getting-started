const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

let client;

/* Depending what enviroment the user is in depends on what REDIS is being used.
   As Redis is only be used for AUTH, AUTH has to be set to true*/
if (process.env.NODE_ENV === 'development' && process.env.AUTH_REQUIRED === 'true') {
  client = redis.createClient(process.env.LOCAL_REDIS_URL);
} else if (process.env.AUTH_REQUIRED === 'true') {
  client = redis.createClient(process.env.REDIS_URL);
}

// If there is an error wrong with the client print it out.
if (process.env.AUTH_REQUIRED === 'true') {
  client.on('error', (err) => {
    console.log(`Redis${err}`);
  });
}


// Passport does not directly manage your session, it only uses the session.
// So you configure session attributes (e.g. life of your session) via express
const sessionOpts = {
  saveUninitialized: false, // saved new sessions
  resave: false, // do not automatically write to the session store
  store: new RedisStore({
    client,
  }),
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    maxAge: 1800000,
  },
};

module.exports = (app) => {
  return app.use(session(sessionOpts));
};
