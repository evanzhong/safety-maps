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

/* COPIED FROM INDEX JS */

const express = require('express')
const app = express()
var request = require('request');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'content-type');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', true);
    next();
  });
  

app.get('/', function (req, res) {
    console.log(Router.data);
    res.send(Router.data);
});

//Example: http://localhost:4000/34.0699698,-118.4396255/34.0707474,-118.4380684
// Working Example: http://localhost:4000/34.0699698,-118.4396255/34.0696565,-118.4393282
app.get('/directions/:start/:end', function (req, res) {
    var data = Router.generatePath(req.params.start, req.params.end);
    if (req.query.mapbox === "off") {
        res.send(data);
        return;
    }
    if (typeof(data) === "string" || data instanceof String) {
        return res.status(500).json({error: data});
    } else {
        var endlen = data.length;
        function makeRequest(return_list, i) {
            var url = "https://api.mapbox.com/matching/v5/mapbox/walking/" + data[i] + "?access_token=" + req.query.access_token;
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    return_list.push(JSON.parse(body));
                    i++;
                    if (i == endlen) {
                        res.json({"route_list": return_list});
                    } else {
                        makeRequest(return_list, i);
                    }
                } else {
                    console.log(error);
                    return res.status(500).json({ type: 'error', message: "Error occurred" });
                }
            });
        }
        makeRequest([], 0);
        
    }
});

app.listen(4000, () => {
    console.log('Router test server started!')
});