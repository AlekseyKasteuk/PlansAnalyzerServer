const secret = require('../config').database.secret;
const jwt = require('jsonwebtoken');

module.exports = (user) => {
    return jwt.sign(user, secret);
};