const router = require('express').Router();
const User = require('../models/User');
const verifyToken = require('./verifyToken');

// Registration route
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body, true);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email)
            return res.status(400).send({ error: 'Email required for login' });
        if (!password)
            return res
                .status(400)
                .send({ error: 'Password required for login' });

        if (typeof email != 'string' || typeof password != 'string')
            return res
                .status(400)
                .send({ error: 'Email and password must be strings' });

        // Guaranteed to be defined if the method finishes without throwing
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
});

// Get the user's account data using a valid JWT
router.get('/account', verifyToken, async (req, res) => {
    res.status(200).send(req.user);
});

// Logs out from a device
router.post('/logout', verifyToken, async (req, res) => {
    try {
        console.log(req.user);
        req.user.tokens = req.user.tokens.filter((token) => {
            return token != req.token;
        });
        await req.user.save();
        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
