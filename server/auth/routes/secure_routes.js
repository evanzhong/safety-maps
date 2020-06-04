const express = require('express');

const router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID; //We need this because we are querying by ObjectId
const dbString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@crimedata-pebxn.mongodb.net/`;

var routesDb = null;

MongoClient.connect(dbString, {"useUnifiedTopology": true}, (error, db) => {
    if (error) {
        console.log("Error in connecting to db for user account route info", req.user)
        throw error;
    }
    routesDb = db.db("routes");
    console.log("[MongoDB] Connected to route database!")
})

//Displays information tailored according to the logged in user - non-logged in users cannot access
router.get('/profile', (req, res, next) => {
    res.json({
        message : 'You are logged in. No information to show yet...',
        user : req.user,
        token : req.query.secret_token
    })
});

router.get('/', (req, res) => {
    res.sendStatus(200);
});

router.get('/account_info', (req, res) => {
    routesDb.collection("user_routes").find({userId: ObjectId(req.user._id)}).toArray((error, userRouteHistory) => {
        if (error) {
            console.log("Error in querying db for user account route info", req.user)
            throw error;
        }
        
        // If there is no error, close the db connectino and send a response with the results back to the client
        //db.close();
        res.json({
            userinfo: req.user,
            history: userRouteHistory,
        });
    });
});

// Evan Note: This was originally going to be done through POST request but we ran into CORS errors that were hard to debug
// GET requests work just as well for this (functionally) as we are not sending any potentially confidential data.
// The only downside is the byte limit for GET requests, but this feature should be nowhere near exceeding that limit
router.get('/save_route', (req, res) => {
    const object = JSON.parse(req.query.object);
    const user = req.user;

    // Modify object with calculated information
    object["userId"] = ObjectId(user._id);
    // let currDate = Date().toString().split(' ')
    // object.date = `${currDate[1]} ${currDate[2]}, ${currDate[3]}`;
    // object.time = currDate[4];
   // console.log(object)

    // Insert into db
    routesDb.collection("user_routes").insertOne(object, (error, document) => {
        if (error) {
            console.log("Error in inserting new saved route to db for user", req.user)
            throw error;
        }
       // console.log("Successfully inserted", document._id);
        //db.close();
        // res.json({
        //     userinfo: req.user,
        //     history: userRouteHistory,
        // });
    });
    res.sendStatus(200);
});

router.get('/favorite_route', (req, res) => {
    const user = req.user;
    const routeRequest = JSON.parse(req.query.routeReq);
    
    routesDb.collection("user_routes").updateOne({"_id": ObjectId(routeRequest["route"]), "userId": ObjectId(user._id)},{$set: {"favorite": routeRequest["favorite"]}}, (err, res) => {
        if (err) {
            console.log("Error updating favorite routes");
            console.log(err);
        }
    }); 
    res.sendStatus(200);
});

module.exports = router;