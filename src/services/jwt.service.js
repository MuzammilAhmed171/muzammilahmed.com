const jwt = require("jsonwebtoken");
const config = require("../config/env");

/* Issues a signed token for the admin session. */
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/* Verifies a token. Throws when invalid or expired. */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
