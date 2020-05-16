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

module.exports = router;