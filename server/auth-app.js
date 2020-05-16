const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const UserModel = require('./model/model');

mongoose.connect('mongodb://127.0.0.1:27017/passport-jwt', { useMongoClient : true });
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;

require('./auth/auth');

app.use( bodyParser.urlencoded({ extended : false }) );

const routes = require('./routes/routes');
const secureRoute = require('./routes/secure-route');

app.use('/', routes);
//We plugin our jwt strategy as a middleware so only verified users can access this route
app.use('/user', passport.authenticate('jwt', { session : false }), secureRoute );

//Handle errors
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error : err });
});

app.listen(3000, () => {
    console.log('Server started')
});