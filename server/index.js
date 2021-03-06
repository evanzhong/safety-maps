const express = require('express')
const app = express()

var request = require('request');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  //intercepts OPTIONS method for preflight issues
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

process.title="safety-maps-server";
 
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use(bodyParser.urlencoded({ extended : false }) );
app.use(bodyParser.json());

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

var process_dirs = require("./navigation/process_directions");

//Example API Call: (route from [-122.1230542,37.4322595] to [-122.15,37.45])
// localhost:8000/directions/mapbox/-122.1230542,37.4322595/-122.15,37.45?access_token=...
app.get('/directions/mapbox/:start/:end', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + req.params.start + ';' + req.params.end + 
    '?steps=true&geometries=geojson&access_token=' + req.query.access_token;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.end(process_dirs.mapbox(JSON.parse(body)));
    } else {
      return res.status(500).end(JSON.stringify({ type: 'error', message: "Error occurred" }));
    }
  })
})

// ------------------ New Routing API

var MongoClient = require('mongodb').MongoClient;
const dbString = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/";
var Router = require('./navigation/router').Router;
MongoClient.connect(dbString, {"useUnifiedTopology": true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("data");
    dbo.collection(process.env.DB_DATA_COLLECTION).find({}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        Router.loadData(result);
    });
});

app.get('/router_data', function (req, res) {
  res.send(Router.data);
});

// Example: http://localhost:8000/directions/safetymaps/34.0699698,-118.4396255/34.0707474,-118.4380684?access_token=...
// Working Example: http://localhost:8000/directions/safetymaps/34.0699698,-118.4396255/34.0696565,-118.4393282?access_token=...
app.get('/directions/safetymaps/:start/:end', async function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var start_split = req.params.start.split(",");
  var end_split = req.params.end.split(",");
  //var data = Router.generatePath(start_split[1] + "," + start_split[0], end_split[1] + "," + end_split[0]);
  //res.send({coords: data});
  Router.generatePath(start_split[1] + "," + start_split[0], end_split[1] + "," + end_split[0], res, req.query.access_token);
  //await process_dirs.safetymaps(data, req.query.access_token, res);
});

app.get('/test/:start/:end', function (req, res) {
  res.send (Router.closestValidCoord([parseFloat(req.params.start),parseFloat(req.params.end)]));
});


// ------------------ End of new routing API

// Exercise Mode Routing
app.get('/exercise/:start/:dist', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var start_split = req.params.start.split(",");
  Router.generateCircularPath(start_split[1] + "," + start_split[0], parseFloat(req.params.dist), res, req.query.access_token);
})
// ------------------ End of Exercise Mode Routing

//Handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error : err });
});

//Listen on port 8000 
app.listen(8000, () => {
  console.log('[SafetyMaps] Server started!')
});