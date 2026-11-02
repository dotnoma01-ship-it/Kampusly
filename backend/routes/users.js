const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
const publicUser = require("../utils/publicUser");

const router = express.Router();

router.use(protect);

function isTransactionUnavailable(error) {
  return error?.code === 20 ||
    /Transaction numbers are only allowed|replica set|transactions are not supported/i.test(
      error?.message || ""
    );
}

async function runFollowMutation(work) {
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (!isTransactionUnavailable(error)) throw error;

    // Standalone MongoDB cannot run transactions. The fallback uses idempotent
    // updates and compensates the first update if the second one fails.
    return work(null);
  } finally {
    await session.endSession();
  }
}

function sessionOptions(session) {
  return session ? { session } : {};
}

router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.json({ success: true, users: [] });
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const users = await User.find({
    status: "active",
    _id: { $ne: req.user._id },
    $or: [
      { name: { $regex: escaped, $options: "i" } },
      { username: { $regex: escaped, $options: "i" } }
    ]
  }).limit(20);

  res.json({
    success: true,
    users: users.map(publicUser)
  });
});

router.patch("/me/profile", async (req, res, next) => {
  try {
    const allowed = [
      "name", "bio", "avatar", "location", "interests",
      "department", "faculty", "matricNumber", "website"
    ];
    const updates = {};

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (updates.name !== undefined &&
        (typeof updates.name !== "string" ||
         updates.name.trim().length < 2 ||
         updates.name.length > 80)) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 80 characters."
      });
    }

    if (updates.bio !== undefined &&
        (typeof updates.bio !== "string" || updates.bio.length > 300)) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 300 characters."
      });
    }

    if (updates.avatar !== undefined &&
        (typeof updates.avatar !== "string" || updates.avatar.length > 2048)) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL is too long."
      });
    }

    if (updates.interests !== undefined &&
        (!Array.isArray(updates.interests) || updates.interests.length > 20)) {
      return res.status(400).json({
        success: false,
        message: "Interests must be an array of at most 20 items."
      });
    }

    for (const field of ["location", "department", "faculty", "matricNumber", "website"]) {
      if (updates[field] !== undefined &&
          (typeof updates[field] !== "string" || updates[field].length > (field === "website" ? 2048 : field === "matricNumber" ? 40 : 100))) {
        return res.status(400).json({
          success: false,
          message: `${field} is invalid or too long.`
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated.",
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      status: "active"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found."
      });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "name username avatar")
      .populate("comments.author", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(30);

    const likesReceived = await Post.aggregate([
      { $match: { author: user._id } },
      { $project: { count: { $size: "$likes" } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    res.json({
      success: true,
      profile: {
        ...publicUser(user),
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: await Post.countDocuments({ author: user._id }),
        likesReceived: likesReceived[0]?.total || 0,
        isFollowing: user.followers.some(
          id => id.toString() === req.user._id.toString()
        )
      },
      posts
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/follow", async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself."
      });
    }

    const result = await runFollowMutation(async (session) => {
      const options = sessionOptions(session);
      const target = await User.findOne({ _id: targetId, status: "active" }, null, options);

      if (!target) {
        throw Object.assign(new Error("Student not found."), { status: 404 });
      }

      const alreadyFollowing = target.followers.some(
        id => id.toString() === req.user._id.toString()
      );

      if (alreadyFollowing) {
        const actor = await User.findById(req.user._id, null, options);
        return { alreadyFollowing: true, actor, target };
      }

      const actor = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { following: target._id } },
        { new: true, ...options }
      );

      try {
        const updatedTarget = await User.findByIdAndUpdate(
          target._id,
          { $addToSet: { followers: req.user._id } },
          { new: true, ...options }
        );

        await Notification.create([{
          recipient: target._id,
          actor: req.user._id,
          type: "follow",
          message: `${req.user.name} started following you.`
        }], options);

        return { alreadyFollowing: false, actor, target: updatedTarget };
      } catch (error) {
        if (!session) {
          await User.updateOne(
            { _id: req.user._id },
            { $pull: { following: target._id } }
          );
        }
        throw error;
      }
    });

    res.json({
      success: true,
      message: result.alreadyFollowing
        ? "You already follow this student."
        : "You are now following this student.",
      isFollowing: true,
      followersCount: result.target.followers.length,
      followingCount: result.actor.following.length
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/follow", async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const result = await runFollowMutation(async (session) => {
      const options = sessionOptions(session);
      const target = await User.findOne({ _id: targetId, status: "active" }, null, options);

      if (!target) {
        throw Object.assign(new Error("Student not found."), { status: 404 });
      }

      const actor = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: target._id } },
        { new: true, ...options }
      );

      try {
        const updatedTarget = await User.findByIdAndUpdate(
          target._id,
          { $pull: { followers: req.user._id } },
          { new: true, ...options }
        );
        return { actor, target: updatedTarget };
      } catch (error) {
        if (!session) {
          await User.updateOne(
            { _id: req.user._id },
            { $addToSet: { following: target._id } }
          );
        }
        throw error;
      }
    });

    res.json({
      success: true,
      message: "You have unfollowed this student.",
      isFollowing: false,
      followersCount: result.target.followers.length,
      followingCount: result.actor.following.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
