const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

//When the user sends a post request to this route, passport authenticates the user based on the
//middleware created previously
router.post('/signup', passport.authenticate('signup', { session : false }) , async (req, res, next) => {
    res.json({
        message : 'Signup successful',
        user : req.user
    });
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {     
        try {
            if(err || !user){
                const error = new Error('An Error occurred')
                return next(error);
            }
            req.login(user, { session : false }, async (error) => {
                if( error ) return next(error)
                const body = { _id : user._id, email : user.email, first_name : user.first_name, last_name : user.last_name };
                //Sign the JWT token and populate the payload with the user email and id
                const token = jwt.sign({ user : body },process.env.JWT_SECRET_KEY);
                //Send back the token to the user
                res.cookie('safety_maps_auth_jwt', token,
                    {
                        maxAge: 86400000, //1 day in milliseconds
                        httpOnly: true
                    }
                );
                return res.json({ "Success": true });
            });     
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    res.clearCookie('safety_maps_auth_jwt');
    return res.sendStatus(200);
});
  
module.exports = router;