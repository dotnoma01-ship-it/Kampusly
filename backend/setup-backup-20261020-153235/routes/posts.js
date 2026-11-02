const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();
const authorFields = "name username avatar";

router.get("/", protect, async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", authorFields)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const category = typeof req.body.category === "string"
      ? req.body.category.trim().slice(0, 50)
      : "General";

    if (!text || text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Post text must be between 1 and 5000 characters."
      });
    }

    const post = await Post.create({
      author: req.user._id,
      text,
      category
    });

    await post.populate("author", authorFields);

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    if (!post.author.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot delete this post." });
    }

    await post.deleteOne();

    res.json({ success: true, message: "Post deleted." });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/like", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const alreadyLiked = post.likes.some(id => id.equals(req.user._id));

    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.addToSet(req.user._id);
    }

    await post.save();

    if (!alreadyLiked && !post.author.equals(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: "like",
        message: `${req.user.name} liked your post.`,
        relatedId: post._id
      });
    }

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!text || text.length > 2000) {
      return res.status(400).json({ success: false, message: "Comment must be 1–2000 characters." });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    post.comments.push({ author: req.user._id, text });
    await post.save();
    await post.populate("comments.author", authorFields);

    if (!post.author.equals(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: "comment",
        message: `${req.user.name} commented on your post.`,
        relatedId: post._id
      });
    }

    res.status(201).json({
      success: true,
      comments: post.comments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
