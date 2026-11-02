const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

const profileFields = "name username bio avatar location interests followers following createdAt";

router.get("/search", protect, async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (q.length < 2 || q.length > 50) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      status: "active",
      $or: [
        { username: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
      ]
    }).select(profileFields).limit(20);

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    const user = await User.findOne({
      _id: req.params.id,
      status: "active"
    }).select(profileFields);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        interests: user.interests,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: user.followers.some(id => id.equals(req.user._id)),
        createdAt: user.createdAt
      },
      posts
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/me/profile", protect, async (req, res, next) => {
  try {
    const allowed = ["name", "bio", "avatar", "location", "interests"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.name !== undefined &&
        (typeof updates.name !== "string" || !updates.name.trim() || updates.name.length > 80)) {
      return res.status(400).json({ success: false, message: "Invalid name." });
    }

    if (updates.bio !== undefined &&
        (typeof updates.bio !== "string" || updates.bio.length > 300)) {
      return res.status(400).json({ success: false, message: "Bio must be 300 characters or fewer." });
    }

    if (updates.location !== undefined &&
        (typeof updates.location !== "string" || updates.location.length > 100)) {
      return res.status(400).json({ success: false, message: "Invalid location." });
    }

    if (updates.avatar !== undefined &&
        (typeof updates.avatar !== "string" || updates.avatar.length > 2000)) {
      return res.status(400).json({ success: false, message: "Invalid avatar URL." });
    }

    if (updates.interests !== undefined &&
        (!Array.isArray(updates.interests) || updates.interests.length > 20 ||
         !updates.interests.every(x => typeof x === "string" && x.length <= 40))) {
      return res.status(400).json({ success: false, message: "Invalid interests." });
    }

    Object.assign(req.user, updates);

    if (updates.name) req.user.name = updates.name.trim();

    await req.user.save();

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        bio: req.user.bio,
        avatar: req.user.avatar,
        location: req.user.location,
        interests: req.user.interests
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/follow", protect, async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself." });
    }

    const target = await User.findOne({ _id: targetId, status: "active" });

    if (!target) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $addToSet: { following: target._id } }),
      User.updateOne({ _id: target._id }, { $addToSet: { followers: req.user._id } })
    ]);

    await Notification.create({
      recipient: target._id,
      actor: req.user._id,
      type: "follow",
      message: `${req.user.name} started following you.`
    });

    res.json({ success: true, isFollowing: true });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/follow", protect, async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Invalid follow request." });
    }

    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $pull: { following: targetId } }),
      User.updateOne({ _id: targetId }, { $pull: { followers: req.user._id } })
    ]);

    res.json({ success: true, isFollowing: false });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
