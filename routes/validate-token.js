const jwt = require('jsonwebtoken');

// Validate the submitted token
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token)
        return res
            .status(401)
            .json({ error: 'No authentication token provided' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Token is not valid' });
    }
};

module.exports = verifyToken;
