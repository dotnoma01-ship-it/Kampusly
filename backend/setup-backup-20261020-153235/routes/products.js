const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.category) filter.category = String(req.query.category).slice(0, 60);
    if (req.query.status) filter.status = String(req.query.status);

    const products = await Product.find(filter)
      .populate("seller", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const { title, description, price, condition, category } = req.body;

    if (typeof title !== "string" || !title.trim() || title.length > 120 ||
        typeof description !== "string" || !description.trim() || description.length > 3000 ||
        !Number.isFinite(price) || price < 0 ||
        typeof category !== "string" || !category.trim() || category.length > 60 ||
        !["like-new", "good", "fair", "well-used"].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid product details."
      });
    }

    const product = await Product.create({
      seller: req.user._id,
      title: title.trim(),
      description: description.trim(),
      price,
      condition,
      category: category.trim()
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    if (!["available", "reserved", "sold"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid product status." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (!product.seller.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot update this listing." });
    }

    product.status = req.body.status;
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
