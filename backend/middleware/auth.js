const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue."
      });
    }

    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured."
      });
    }

    const decoded = jwt.verify(token, secret, {
      issuer: "kampusly-api",
      audience: "kampusly-app"
    });

    const user = await User.findById(decoded.sub);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "This account is unavailable. Please log in again."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or has expired."
      });
    }

    next(error);
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required."
    });
  }

  next();
}

module.exports = { protect, adminOnly };
