const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id
  })
    .populate("actor", "name username avatar")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    success: true,
    notifications,
    unreadCount: notifications.filter(item => !item.read).length
  });
});

router.patch("/read-all", async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({
    success: true,
    message: "Notifications marked as read."
  });
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID."
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id
      },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
