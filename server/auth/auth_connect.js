const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
require('./model');
require('./passport_schemes');

const dbString = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + 
    "@crimedata-pebxn.mongodb.net/" + process.env.DB_NAME + "?retryWrites=true&w=majority";
mongoose.connect(dbString, {useNewUrlParser: true});
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;