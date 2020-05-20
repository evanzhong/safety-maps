const dotenv = require('dotenv');
dotenv.config();

var MongoClient = require('mongodb').MongoClient;
const dbString = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@crimedata-pebxn.mongodb.net/";

var Router = require('./navigation/router').Router;

MongoClient.connect(dbString, {"useUnifiedTopology": true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("data");
    dbo.collection("Crime_Data").find({}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        Router.loadData(result);
    });
});


const express = require('express')
const app = express()

app.get('/', function (req, res) {
    console.log(Router.data);
    res.send(Router.data);
});

app.listen(4000, () => {
    console.log('Router test server started!')
});