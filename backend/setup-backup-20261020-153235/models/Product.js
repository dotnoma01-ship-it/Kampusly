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
    min: 0
  },
  condition: {
    type: String,
    enum: ["like-new", "good", "fair", "well-used"],
    required: true
  },
  category: {
    type: String,
    required: true,
    maxlength: 60
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available"
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
