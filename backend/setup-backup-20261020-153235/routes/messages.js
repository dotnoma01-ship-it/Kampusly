const express = require("express");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("participants", "name username avatar")
      .sort({ lastMessageAt: -1 })
      .limit(100);

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
});

router.post("/:userId", protect, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId) || userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Invalid recipient." });
    }

    const recipient = await User.findOne({ _id: userId, status: "active" });

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found." });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipient._id], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipient._id]
      });
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
});

router.post("/:conversationId/send", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID." });
    }

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!text || text.length > 5000) {
      return res.status(400).json({ success: false, message: "Message must be 1–5000 characters." });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    conversation.messages.push({
      sender: req.user._id,
      text,
      readBy: [req.user._id]
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const recipient = conversation.participants.find(
      id => !id.equals(req.user._id)
    );

    if (recipient) {
      await Notification.create({
        recipient,
        actor: req.user._id,
        type: "message",
        message: `${req.user.name} sent you a message.`,
        relatedId: conversation._id
      });
    }

    res.status(201).json({
      success: true,
      message: conversation.messages[conversation.messages.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:conversationId", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID." });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    }).populate("participants", "name username avatar");

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
