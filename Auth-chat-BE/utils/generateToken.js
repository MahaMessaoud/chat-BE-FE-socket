const jwt = require('jsonwebtoken');

const generateToken = (id, username) => {  // Add username parameter
    return jwt.sign({ id, username }, process.env.JWT_SECRET, { // Include username in payload
        expiresIn: process.env.JWT_EXPIRES,
    });
}

module.exports = generateToken;
