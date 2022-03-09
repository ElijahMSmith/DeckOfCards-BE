const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    // Strip and verify the token submitted
    let data, token;
    try {
        token = req.header('Authorization').replace('Bearer ', '');
        data = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res
            .status(400)
            .send({ error: 'Provided authorization token is invalid.' });
    }

    User.findOne({
        _id: data._id,
        tokens: token,
    }).exec(function (err, user) {
        if (err || !user)
            return res.status(401).send({
                error: 'Not authorized to access this resource',
            });

        // Add the user data to the request body for use by the main route
        req.user = user;
        req.token = token;
        next();
    });
};

module.exports = verifyToken;
