const router = require('express').Router();
const User = require('../models/User');

// Registration route
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
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
        const user = await User.findByCredentials(email, password);
        if (!user)
            return res
                .status(401)
                .send({ error: 'Login failed with invalid credentials' });

        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
});

// Get the user's account data using a valid JWT
router.get('/account', auth, async (req, res) => {
    res.status(200).send(req.user);
});

// Logs out from a device
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token;
        });
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
