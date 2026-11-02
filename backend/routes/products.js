const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/saved", async (req, res) => {
  const products = await Product.find({
    savedBy: req.user._id,
    status: "available"
  })
    .populate("seller", "name username avatar")
    .sort({ updatedAt: -1 })
    .limit(100);

  res.json({
    success: true,
    products: products.map(product => ({ ...product.toObject(), savedByMe: true }))
  });
});

router.get("/", async (req, res) => {
  const filter = {};
  const ownListings = req.query.mine === "true";

  if (ownListings) {
    filter.seller = req.user._id;
  }

  if (req.query.category) {
    filter.category = String(req.query.category);
  }

  if (req.query.status) {
    filter.status = String(req.query.status);
  } else if (!ownListings) {
    filter.status = "available";
  }

  const products = await Product.find(filter)
    .populate("seller", "name username avatar")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    products: products.map(product => {
      const productData = product.toObject();
      productData.savedByMe = product.savedBy.some(
        userId => userId.equals(req.user._id)
      );
      return productData;
    })
  });
});

router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      category,
      images,
      location
    } = req.body;

    if (!title || !description || price === undefined ||
        !condition || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, price, condition and category are required."
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) ||
        numericPrice <= 0 ||
        numericPrice > 1000000000) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid price greater than zero."
      });
    }

    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      price: numericPrice,
      condition,
      category,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      location: typeof location === "string" ? location.trim().slice(0, 120) : ""
    });

    await product.populate("seller", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Your listing has been created.",
      product
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/save", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid listing ID." });
    }

    const product = await Product.findById(req.params.id);
    if (!product || product.status !== "available") {
      return res.status(404).json({ success: false, message: "Available listing not found." });
    }

    const alreadySaved = product.savedBy.some(id => id.equals(req.user._id));
    if (alreadySaved) product.savedBy.pull(req.user._id);
    else product.savedBy.addToSet(req.user._id);
    await product.save();

    res.json({ success: true, saved: !alreadySaved });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const { status } = req.body;

    if (!["available", "reserved", "sold"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be available, reserved or sold."
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Listing not found."
      });
    }

    if (product.seller.toString() !== req.user._id.toString() &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the seller can update this listing."
      });
    }

    product.status = status;
    await product.save();

    res.json({
      success: true,
      message: "Listing status updated.",
      product
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Listing not found."
      });
    }

    if (product.seller.toString() !== req.user._id.toString() &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this listing."
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Listing deleted."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
