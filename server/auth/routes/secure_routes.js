const express = require('express');

const router = express.Router();

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

    const MongoClient = require('mongodb').MongoClient;
    const ObjectId = require('mongodb').ObjectID; //We need this because we are querying by ObjectId

    const dbString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@crimedata-pebxn.mongodb.net/`;
    MongoClient.connect(dbString, {"useUnifiedTopology": true}, (error, db) => {
        if (error) {
            console.log("Error in connecting to db for user account route info", req.user)
            throw error;
        }

        const routesDb = db.db("routes");
        routesDb.collection("user_routes").find({userId: ObjectId(req.user._id)}).toArray((error, userRouteHistory) => {
            if (error) {
                console.log("Error in querying db for user account route info", req.user)
                throw error;
            }
            
            // If there is no error, close the db connectino and send a response with the results back to the client
            db.close();
            res.json({
                userinfo: req.user,
                history: userRouteHistory,
            });
        });
    });
    // TODO : QUERY DATABASE TO GET HISTORY, USING req.user info
    // req.user: {_id: .., email: .., first_name: .., last_name: ..}
    // res.json({
    //     userinfo: req.user,
    //     history: [
    //         {
    //             exerciseMode: true,
    //             timeStamp: "UNIX TIME",
    //             name: "3.5 mile walk",
    //             start: "UCLA",
    //             end: "505 Landfair Ave, Apt 606",
    //             route: {"success":true,"coordinates":[[-118.444572,34.070992],[-118.445618,34.071011],[-118.44648,34.070957],[-118.447983,34.070961],[-118.448608,34.070751],[-118.448936,34.07074],[-118.449234,34.070702],[-118.450729,34.070694],[-118.450897,34.070648],[-118.451195,34.070435],[-118.451782,34.070427],[-118.451866,34.07032],[-118.452415,34.070602],[-118.452644,34.070671],[-118.453064,34.070641],[-118.453255,34.070549],[-118.453133,34.070377]],"turn-by-turn-directions":[{"label":"Head west on Bruin Walk","distance":377.46},{"label":"Keep right onto Bruin Walk","distance":30},{"label":"Keep left onto Bruin Walk","distance":28},{"label":"Continue straight","distance":247},{"label":"Turn left","distance":15},{"label":"Turn right onto Gayley Avenue","distance":142},{"label":"Turn left onto Landfair Avenue","distance":22.178},{"label":"You have arrived at your destination","distance":0}],"error":null},
    //             type: "walk",
    //             date: "5/31/20",
    //             time: '12:15 pm',
    //             distance: 11,
    //             runtime: 1553,
    //             favorite: false
    //         },
    //         {
    //             name: "6 mile run",
    //             start: "UCLA",
    //             end: "505 Landfair Ave, Apt 606",
    //             route: {
    //                 "success": true,
    //                 "coordinates": [
    //                     [-118, 34], [-118.001,34.001]
    //                 ],
    //                 "turn-by-turn-directions": [
    //                     { label: "Instruction 1",
    //                     distance: 195 },
    //                     { label: "Instruction 2",
    //                         distance: 100}
    //                 ]
    //             },
    //             type: "run",
    //             date: "6/15/20",
    //             time: '8:15 am',
    //             distance: 15,
    //             runtime: 1899,
    //             favorite: false
    //         },
    //         {
    //             name: "10 mile bike",
    //             start: "UCLA",
    //             end: "505 Landfair Ave, Apt 606",
    //             route: {
    //                 "success": true,
    //                 "coordinates": [
    //                     [-118, 34], [-118.001,34.001]
    //                 ],
    //                 "turn-by-turn-directions": [
    //                     { label: "Instruction 1",
    //                     distance: 195 },
    //                     { label: "Instruction 2",
    //                         distance: 100}
    //                 ]
    //             },
    //             type: "bike",
    //             date: "5/15/20",
    //             time: '6:00 pm',
    //             distance: 15,
    //             runtime: 1305,
    //             favorite: true
    //         }
    //     ]
    // });
});

module.exports = router;