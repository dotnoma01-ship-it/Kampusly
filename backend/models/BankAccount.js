const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountNameEncrypted: {
    type: String,
    required: true,
    select: false
  },
  accountNumberEncrypted: {
    type: String,
    required: true,
    select: false
  },
  accountNumberLast4: {
    type: String,
    required: true,
    select: false
  }
}, {
  timestamps: true
});

bankAccountSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("BankAccount", bankAccountSchema);
