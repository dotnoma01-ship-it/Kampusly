const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000000
  },
  currency: {
    type: String,
    default: "NGN",
    enum: ["NGN"]
  },
  condition: {
    type: String,
    enum: ["like-new", "good", "fair", "well-used"],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },
  images: [{
    type: String,
    maxlength: 2048
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  location: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ""
  },
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available",
    index: true
  }
}, {
  timestamps: true
});

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
