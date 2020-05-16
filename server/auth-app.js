const express = require('express');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const UserModel = require('./auth/model');
const dotenv = require('dotenv');
dotenv.config();

const dbString = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + 
    "@crimedata-pebxn.mongodb.net/" + process.env.DB_NAME + "?retryWrites=true&w=majority";
mongoose.connect(dbString, {useNewUrlParser: true});
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;


require('./auth/auth');

app.use( bodyParser.urlencoded({ extended : false }) );

const routes = require('./routes/routes');
const secureRoute = require('./routes/secure-routes');

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