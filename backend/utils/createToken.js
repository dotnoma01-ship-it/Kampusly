const jwt = require("jsonwebtoken");

module.exports = function createToken(userId) {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }

  return jwt.sign(
    { sub: userId.toString() },
    secret,
    {
      expiresIn: "1h",
      issuer: "kampusly-api",
      audience: "kampusly-app"
    }
  );
};
