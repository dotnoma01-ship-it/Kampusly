const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ["transfer", "withdrawal", "deposit"],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: "NGN"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected", "failed"],
    default: "pending"
  },
  description: {
    type: String,
    maxlength: 300
  },
  idempotencyKey: {
    type: String,
    trim: true,
    maxlength: 128
  },
  idempotencyPayloadHash: {
    type: String,
    select: false
  },
  withdrawalBankName: String,
  withdrawalAccountName: String,
  withdrawalAccountNumber: { type: String, select: false },
  withdrawalAccountLast4: String,
  withdrawalBankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount"
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  processedAt: Date
}, {
  timestamps: true
});

transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index(
  { sender: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } }
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
