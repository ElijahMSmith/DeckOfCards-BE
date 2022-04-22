import User from '../models/User';
import jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    // Strip and verify the token submitted
    let data: any, token: string;
    try {
        token = req.header('Authorization').replace('Bearer ', '');
        data = jwt.verify(token, process.env.JWT_SECRET);
        console.log('data', data);
    } catch (error) {
        console.error('Error 400 - verify token\n' + error);
        return res
            .status(400)
            .send({ error: 'Provided authorization token is invalid.' });
    }

    User.findOne({
        _id: data._id,
        tokens: token,
    }).exec(function (err, user) {
        console.log(err, user);
        if (err || !user) {
            console.log('Error 401 - Find user\n' + err);
            return res.status(401).send({
                error: 'Not authorized to access this resource',
            });
        }

        // Add the user data to the request body for use by the main route
        req.user = user;
        req.token = token;
        next();
    });
};

export default verifyToken;
