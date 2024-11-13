const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please enter your name"],
    },
    firstName: {
      type: String,
      required: [false],
    },
    lastName: {
      type: String,
      required: [false],
    },
    dob: {
      type: Date,
      required: [false],
    },
    age: {
      type: Number,
      required: [false],
    },
    shortDescription: {
      type: String,
      required: [false],
      maxlength: [50, "Should not be greater than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: String,
    role: {
      type: String,
      enum: ["user", "admin","seller"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Ensure password is not returned in query results
    },
    passwordconfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // Only runs on CREATE and SAVE, not on UPDATE
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match!",
      },
      select: false,
    },
    tours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordconfirm = undefined;
  next();
});

// Pre 'findOneAndUpdate' middleware to hash the password if updated
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // Only hash password if it is being updated
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 12);
    update.passwordconfirm = undefined; // No need to store passwordconfirm
  }

  next();
});

// Instance method to check if the provided password is correct
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
