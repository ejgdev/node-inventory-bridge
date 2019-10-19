
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var authRoutes = require('./routes/auth');
var inventoryRoutes = require('./routes/inventory');
var http = require('http');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var errorHandler = require('errorhandler');
var flash = require('connect-flash');
var debug = require('debug')("web-server");
var debugAuth = require('debug')("auth");
var jackrabbit = require('jackrabbit');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var pug = require('pug');

global.rabbit = jackrabbit(process.env.CLOUDAMQP_URL || "amqp://guest:guest@localhost:5672");

var app = express();

passport.serializeUser(function(user,done){
  done(null, "admin");
});

passport.deserializeUser(function(user,done){
  done(null, "admin");
})

passport.use(new LocalStrategy(function(username,password,done){
  if(!username || !password || username !== process.env.AUTH_USER || password !== process.env.AUTH_PASSWORD)
    return done(null, false, { message: 'Incorrect username and password combination.' });

  return done(null, username);
}));

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'holsteerules',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(serveStatic(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', isAuthenticated,routes.index);
app.post('/inventory/run', isAuthenticated, inventoryRoutes.executeWorker);
app.get('/login', authRoutes.loginView);
app.post('/login', passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login', failureFlash: true }), authRoutes.authenticate );
http.createServer(app).listen(app.get('port'), function(){
  debug('Express server listening on port ' + app.get('port'));
});
