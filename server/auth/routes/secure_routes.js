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
    // TODO : QUERY DATABASE TO GET HISTORY, USING req.user info
    // req.user: {_id: .., email: .., first_name: .., last_name: ..}
    res.json({
        userinfo: req.user,
        history: [
            {
                name: "3.5 mile walk",
                start: "UCLA",
                end: "505 Landfair Ave, Apt 606",
                route: {
                    "success": true,
                    "coordinates": [
                        [-118, 34], [-118.001,34.001]
                    ],
                    "turn-by-turn-directions": [
                        { label: "Instruction 1",
                        distance: 195 },
                        { label: "Instruction 2",
                            distance: 100}
                    ]
                },
                type: "walk",
                date: "5/31/20",
                time: '12:15 pm',
                distance: 11,
                runtime: 1553,
                favorite: false
            },
            {
                name: "6 mile run",
                start: "UCLA",
                end: "505 Landfair Ave, Apt 606",
                route: {
                    "success": true,
                    "coordinates": [
                        [-118, 34], [-118.001,34.001]
                    ],
                    "turn-by-turn-directions": [
                        { label: "Instruction 1",
                        distance: 195 },
                        { label: "Instruction 2",
                            distance: 100}
                    ]
                },
                type: "run",
                date: "6/15/20",
                time: '8:15 am',
                distance: 15,
                runtime: 1899,
                favorite: false
            },
            {
                name: "10 mile bike",
                start: "UCLA",
                end: "505 Landfair Ave, Apt 606",
                route: {
                    "success": true,
                    "coordinates": [
                        [-118, 34], [-118.001,34.001]
                    ],
                    "turn-by-turn-directions": [
                        { label: "Instruction 1",
                        distance: 195 },
                        { label: "Instruction 2",
                            distance: 100}
                    ]
                },
                type: "bike",
                date: "5/15/20",
                time: '6:00 pm',
                distance: 15,
                runtime: 1305,
                favorite: true
            }
        ]
    });
});

module.exports = router;