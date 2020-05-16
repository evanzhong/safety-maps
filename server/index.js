const express = require('express')
const app = express()

var request = require('request');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
 
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use(bodyParser.urlencoded({ extended : false }) );

//Authentication Routing
require("./auth/auth_connect");
const routes = require('./auth/routes/routes');
const secureRoute = require('./auth/routes/secure_routes');
app.use('/auth', routes);
//We plugin our jwt strategy as a middleware so only verified users can access this route
app.use('/auth/secure', passport.authenticate('jwt', { session : false }), secureRoute );

//Authentication API Tester
app.get('/auth_test', function(req, res) {
  res.sendFile(__dirname + '/auth/auth_test.html');
});

app.get('/', function (req, res) {
  res.send('Hello World')
});

//Example API Call: (route from [-122.1230542,37.4322595] to [-122.15,37.45])
// localhost:8000/api/directions/-122.1230542,37.4322595/-122.15,37.45?access_token=...
app.get('/directions/:start/:end', function (req, res) {
  var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + req.params.start + ';' + req.params.end + 
    '?steps=true&geometries=geojson&access_token=' + req.query.access_token;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(JSON.parse(body));
    } else {
      return res.status(500).json({ type: 'error', message: "Error occurred" });
    }
  })
})

//Handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error : err });
});

//Listen on port 8000 
app.listen(8000, () => {
  console.log('[SafetyMaps] Server started!')
});