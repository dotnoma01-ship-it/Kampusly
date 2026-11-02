const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-z0-9_.]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 254
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  bio: {
    type: String,
    default: "",
    maxlength: 300
  },
  avatar: {
    type: String,
    default: "",
    maxlength: 2048
  },
  location: {
    type: String,
    default: "",
    maxlength: 100
  },
  department: { type: String, default: "", maxlength: 100 },
  faculty: { type: String, default: "", maxlength: 100 },
  matricNumber: { type: String, default: "", maxlength: 40 },
  website: { type: String, default: "", maxlength: 2048 },
  interests: [{
    type: String,
    trim: true,
    maxlength: 40
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  role: {
    type: String,
    enum: [
      "student",
      "seller",
      "food_vendor",
      "laundry_provider",
      "grocery_shopper",
      "admin"
    ],
    default: "student"
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active"
  }
}, {
  timestamps: true
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
