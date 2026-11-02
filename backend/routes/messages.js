const express = require("express");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id
  })
    .populate("participants", "name username avatar")
    .sort({ lastMessageAt: -1 })
    .limit(100);

  res.json({
    success: true,
    conversations
  });
});

router.post("/:userId", async (req, res, next) => {
  try {
    const otherId = req.params.userId;

    if (!mongoose.isValidObjectId(otherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    if (otherId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself."
      });
    }

    const otherUser = await User.findOne({
      _id: otherId,
      status: "active"
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    const participants = [
      req.user._id,
      otherUser._id
    ];

    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants
      });
    }

    await conversation.populate("participants", "name username avatar");

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:conversationId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID."
      });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    })
      .populate("participants", "name username avatar")
      .populate("messages.sender", "name username avatar");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found."
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:conversationId/read", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID." });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.conversationId, participants: req.user._id },
      { $addToSet: { "messages.$[message].readBy": req.user._id } },
      {
        new: true,
        arrayFilters: [{ "message.sender": { $ne: req.user._id } }]
      }
    );
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/:conversationId/send", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID."
      });
    }

    const text = typeof req.body.text === "string"
      ? req.body.text.trim()
      : "";

    if (!text || text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must contain between 1 and 5000 characters."
      });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found."
      });
    }

    conversation.messages.push({
      sender: req.user._id,
      text,
      readBy: [req.user._id]
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const recipient = conversation.participants.find(
      id => id.toString() !== req.user._id.toString()
    );

    if (recipient) {
      await Notification.create({
        recipient,
        actor: req.user._id,
        type: "message",
        relatedId: conversation._id,
        message: `${req.user.name} sent you a message.`
      });
    }

    await conversation.populate("messages.sender", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Message sent.",
      conversation
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
