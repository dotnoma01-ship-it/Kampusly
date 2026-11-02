const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Notification = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", async (req, res) => {
  const [
    users,
    activeUsers,
    posts,
    products,
    pendingWithdrawals
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    Post.countDocuments(),
    Product.countDocuments(),
    Transaction.countDocuments({
      type: "withdrawal",
      status: "pending"
    })
  ]);

  res.json({
    success: true,
    stats: {
      users,
      activeUsers,
      posts,
      products,
      pendingWithdrawals
    }
  });
});

router.get("/users", async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50);

  res.json({
    success: true,
    users,
    page
  });
});

router.patch("/users/:id/status", async (req, res) => {
  if (!["active", "suspended"].includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be active or suspended."
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  res.json({
    success: true,
    user
  });
});

router.get("/withdrawals", async (req, res) => {
  const withdrawals = await Transaction.find({
    type: "withdrawal",
    status: "pending"
  })
    .populate("sender", "name username email")
    .sort({ createdAt: 1 })
    .limit(100);

  res.json({
    success: true,
    withdrawals
  });
});

router.patch("/withdrawals/:id/review", async (req, res, next) => {
  const { decision } = req.body;

  if (!["approve", "reject"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Decision must be approve or reject."
    });
  }

  if (decision === "approve") {
    return res.status(501).json({
      success: false,
      message: "Withdrawal payouts are not enabled. Configure and verify a payout provider before approving requests."
    });
  }

  const mongoose = require("mongoose");
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
        type: "withdrawal",
        status: "pending"
      }).session(session);

      if (!transaction) {
        throw Object.assign(new Error("Pending withdrawal not found."), {
          status: 404
        });
      }

      if (decision === "reject") {
        const wallet = await Wallet.findById(transaction.wallet).session(session);

        if (!wallet) {
          throw Object.assign(new Error("Wallet not found."), { status: 404 });
        }

        wallet.balance += transaction.amount;
        await wallet.save({ session });
        transaction.status = "rejected";
      }

      transaction.processedBy = req.user._id;
      transaction.processedAt = new Date();

      await transaction.save({ session });
    });

    res.json({
      success: true,
      message: "Withdrawal rejected and the reserved amount returned to the wallet."
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

router.post("/notifications", async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message ||
        typeof message !== "string" ||
        message.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: "A recipient ID and message of up to 300 characters are required."
      });
    }

    const user = await User.findById(recipientId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found."
      });
    }

    const notification = await Notification.create({
      recipient: user._id,
      actor: req.user._id,
      type: "system",
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
