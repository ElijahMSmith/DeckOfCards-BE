const router = require('express').Router();
const User = require('../models/User');
const userSchema = require('../JOI_schemas/user.js');
const bcrypt = require('bcryptjs');

// Registration route
router.post('/register', async (req, res) => {
    // Validate the user
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check that email hasn't been used yet
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
        return res.status(400).json({ error: 'Email already exists' });

    bcrypt
        .hash(req.body.password, 10)
        .then(async (hash) => {
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: hash,
                // replays an empty array by default
            });

            try {
                const savedUser = await user.save();
                res.status(200).json({ userId: savedUser._id });
            } catch (error) {
                console.log(error);
                res.status(400).json({ error });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
        });
});

module.exports = router;
