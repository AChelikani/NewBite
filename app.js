// Including Express.js and Stormpath
var express = require('express');
var stormpath = require('express-stormpath');
var yelp = require('yelp');
var app = express();


// Setting up jade as the view engine
app.set('views', './views');
app.set('view engine', 'jade');

// Using my stormpath credentials to intialize stormpath middleware
// More params can be added for more customization
var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: 'apiKey.properties',
  application: 'https://api.stormpath.com/v1/applications/5WbefiZ9jkZkusio1ujUOq',
  secretKey: 'zjadsflajkklsdfalkd',
  expandCustomData: true,
  enableForgotPassword: true
});

app.use(stormpathMiddleware);

// Rendering home page
app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});

// Rendering map page
app.get('/map', function(req, res) {
  res.render('map.jade', {
    title: 'Map',
    require: require
  });
});

app.use('/profile',stormpath.loginRequired,require('./profile')());

app.listen(5000);