var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: 'apiKey.properties',
  application: 'https://api.stormpath.com/v1/applications/5WbefiZ9jkZkusio1ujUOq',
  secretKey: 'zjadsflajkklsdfalkd',
  expandCustomData: true,
  enableForgotPassword: true
});

app.use(stormpathMiddleware);

app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});

app.get('/profile', function(req, res) {
   res.render('profile', {
	 title: 'Profile'
   });
});



app.listen(5000);