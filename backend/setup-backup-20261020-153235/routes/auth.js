const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function makeToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1h", issuer: "kampusly-api", audience: "kampusly-app" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    role: user.role
  };
}

router.post("/register", async (req, res, next) => {
  try {
    let { name, username, email, password } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    username = typeof username === "string" ? username.trim().toLowerCase() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !username || !email || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name, username, email and password are required."
      });
    }

    if (name.length > 80 || !/^[a-z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Check your name and username format."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters."
      });
    }

    const existing = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "That email or username is already registered."
      });
    }

    const user = await User.create({ name, username, email, password });

    res.status(201).json({
      success: true,
      user: publicUser(user),
      token: makeToken(user),
      expiresIn: 3600
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That email or username is already registered."
      });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    const password = req.body.password;

    if (!email || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is unavailable."
      });
    }

    res.json({
      success: true,
      user: publicUser(user),
      token: makeToken(user),
      expiresIn: 3600
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      ...publicUser(req.user),
      email: req.user.email,
      location: req.user.location,
      interests: req.user.interests
    }
  });
});

module.exports = router;
