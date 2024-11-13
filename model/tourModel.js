const mongoose = require("mongoose");

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"],
    },
    description: {
      type: String,
      required: [false],
      maxlength: [
        150,
        "A tour description must have less or equal than 150 characters",
      ],
      minlength: [
        10,
        "A tour description must have more or equal than 10 characters",
      ],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, or difficult",
      },
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [10, "Rating must be below 10.0"],
      default: 5,
    },
    photo: String,
    // Store the userId as an ObjectId, referencing the User model
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A tour must have a user id"],
    },
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", toursSchema);

module.exports = Tour;
