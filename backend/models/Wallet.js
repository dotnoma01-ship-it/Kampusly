const mongoose = require("mongoose");
const crypto = require("crypto");

const walletSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  walletNumber: {
    type: String,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: "NGN",
    enum: ["NGN"]
  },
  status: {
    type: String,
    enum: ["active", "frozen"],
    default: "active"
  }
}, {
  timestamps: true
});

walletSchema.pre("validate", function () {
  if (!this.walletNumber) {
    this.walletNumber = "KMP" + crypto.randomInt(100000000, 999999999);
  }
});

module.exports = mongoose.model("Wallet", walletSchema);
