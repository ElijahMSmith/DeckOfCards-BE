const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    // Strip and verify the token submitted
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_SECRET);

    try {
        const user = await User.findOne({
            _id: data._id,
            'tokens.token': token,
        });
        if (!user) throw new Error();

        // Add the user data to the request body for use by the main route
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({
            error: 'Not authorized to access this resource',
        });
    }
};

module.exports = verifyToken;
