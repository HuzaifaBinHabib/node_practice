const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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

    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    quantity: {
      type: Number,
      min: [0, "Quantity must be above -1"],
      default: 0,
    },
    color: String, 
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

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
