const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 8
  },
  bio: {
    type: String,
    default: "",
    maxlength: 300
  },
  avatar: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: "",
    maxlength: 100
  },
  interests: {
    type: [String],
    default: []
  },
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
    enum: ["student", "vendor", "admin"],
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

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
