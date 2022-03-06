const joi = require('@hapi/joi');

module.exports = joi.object({
    username: joi.string().max(255).required(),
    password: joi.string().min(7).max(255).required(),
    email: joi.string().max(255).required().email(),
});
