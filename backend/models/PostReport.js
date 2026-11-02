const mongoose = require("mongoose");

const postReportSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reason: {
    type: String,
    enum: ["spam", "harassment", "inappropriate", "misinformation", "other"],
    required: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed", "actioned"],
    default: "pending"
  }
}, {
  timestamps: true
});

postReportSchema.index({ post: 1, reporter: 1 }, { unique: true });
postReportSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("PostReport", postReportSchema);