const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('./model');
var validator = require("email-validator");

//Create a passport middleware to handle user registration
passport.use('signup', new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }, async (req, email, password, done) => {
        try {
            //Save the information provided by the user to the the database
            const first_name = req.query.first_name;
            const last_name = req.query.last_name;
            if (!validator.validate(email)) {
                return done("Invalid email");
            } else if (!first_name || !last_name || first_name.length == 0 
                || first_name.length > 32 || last_name.length == 0 || last_name.length > 32) {
                return done("Invalid name");
            } else if (password.length < 8 || password.length > 32) {
                return done("Invalid password");
            }
            const user = await UserModel.create({ email, password, first_name, last_name });
            //Send the user information to the next middleware
            return done(null, user);
        } catch (error) {
            done(error);
        }
    }
));

//Create a passport middleware to handle User login
passport.use('login', new localStrategy({
        usernameField : 'email',
        passwordField : 'password'
    }, async (email, password, done) => {
    try {
        //Find the user associated with the email provided by the user
        const user = await UserModel.findOne({ email });
        if( !user ){
            //If the user isn't found in the database, return a message
            return done(null, false, { message : 'User not found'});
        }
        //Validate password and make sure it matches with the corresponding hash stored in the database
        //If the passwords match, it returns a value of true.
        const validate = await user.isValidPassword(password);
        if( !validate ){
            return done(null, false, { message : 'Wrong Password'});
        }
        //Send the user information to the next middleware
        return done(null, user, { message : 'Logged in Successfully'});
    } catch (error) {
        return done(error);
    }
}));

const JWTstrategy = require('passport-jwt').Strategy;
//We use this to extract the JWT sent by the user
const ExtractJWT = require('passport-jwt').ExtractJwt;

//This verifies that the token sent by the user is valid
passport.use(new JWTstrategy(
    {
        //secret we used to sign our JWT
        secretOrKey : process.env.JWT_SECRET_KEY,
        //we expect the user to send the token as a query parameter with the name 'secret_token'
        jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
    }, async (token, done) => {
        try {
            //Pass the user details to the next middleware
            return done(null, token.user);
        } catch (error) {
            done(error);
        }
    }
));