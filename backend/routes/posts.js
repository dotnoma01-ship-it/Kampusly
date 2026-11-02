const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const PostReport = require("../models/PostReport");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

  const posts = await Post.find()
    .populate("author", "name username avatar")
    .populate("comments.author", "name username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const currentUserId = req.user._id.toString();

  const formattedPosts = posts.map((post) => {
    const postData = post.toObject();

    postData.likedByMe = post.likes.some(
      (userId) => userId.toString() === currentUserId
    );

    postData.likesCount = post.likes.length;
    postData.savedByMe = post.savedBy.some(
      (userId) => userId.toString() === currentUserId
    );
    postData.commentsCount = post.comments.length;

    return postData;
  });

  res.json({
    success: true,
    posts: formattedPosts,
    page,
    hasMore: posts.length === limit
  });
});

router.post("/upload", (req, res, next) => {
  upload.array("images", 4)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.code === "LIMIT_FILE_SIZE"
          ? "Each image must not exceed 5 MB."
          : error.message || "Image upload failed."
      });
    }

    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image."
      });
    }

    const images = req.files.map(
      file => `/uploads/${file.filename}`
    );

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully.",
      images
    });
  } catch (error) {
    next(error);
  }
});
router.post("/", async (req, res, next) => {
  try {
    const text = typeof req.body.text === "string"
      ? req.body.text.trim()
      : "";

    if (!text || text.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Post text is required and must not exceed 3000 characters."
      });
    }

    const images = Array.isArray(req.body.images)
      ? req.body.images.slice(0, 4)
      : [];

    if (images.some(image => typeof image !== "string" || image.length > 2048)) {
      return res.status(400).json({
        success: false,
        message: "One or more image URLs are invalid."
      });
    }

    const post = await Post.create({
      author: req.user._id,
      text,
      category: String(req.body.category || "general").slice(0, 50),
      images
    });

    await post.populate("author", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Your post has been published.",
      post
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/like", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const alreadyLiked = post.likes.some(
      id => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.addToSet(req.user._id);

      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          actor: req.user._id,
          type: "like",
          relatedId: post._id,
          message: `${req.user.name} liked your post.`
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/save", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const alreadySaved = post.savedBy.some(
      id => id.toString() === req.user._id.toString()
    );
    if (alreadySaved) post.savedBy.pull(req.user._id);
    else post.savedBy.addToSet(req.user._id);
    await post.save();

    res.json({ success: true, saved: !alreadySaved });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/report", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID." });
    }

    const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";
    const details = typeof req.body.details === "string" ? req.body.details.trim() : "";
    const allowedReasons = ["spam", "harassment", "inappropriate", "misinformation", "other"];

    if (!allowedReasons.includes(reason) || details.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Select a report reason and keep additional details under 500 characters."
      });
    }

    const post = await Post.findById(req.params.id).select("_id author");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    if (post.author.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot report your own post." });
    }

    try {
      await PostReport.create({
        post: post._id,
        reporter: req.user._id,
        reason,
        details
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already reported this post."
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Your report was submitted for review."
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const text = typeof req.body.text === "string"
      ? req.body.text.trim()
      : "";

    if (!text || text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain between 1 and 1000 characters."
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    post.comments.push({
      author: req.user._id,
      text
    });

    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: "comment",
        relatedId: post._id,
        message: `${req.user.name} commented on your post.`
      });
    }

    await post.populate("comments.author", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Comment added.",
      comments: post.comments
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this post."
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


