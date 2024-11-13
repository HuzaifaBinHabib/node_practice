const Product = require("../model/productModel");
const User = require('../model/userModel'); // Ensure correct import

const createProduct = async (req, res) => {
    try {
      // Automatically associate the product with the logged-in user
      const productData = {
        ...req.body,
        userId: req.user._id, // userId from the authenticated user
      };
  
      const newProduct = await Product.create(productData);
  
      // Update the user document to include this product ID in their 'products' field
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { products: newProduct._id } }, // Add product ID to user's products array
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({
        status: "fail",
        message: "User not found" 
      });
      }
  
      res.status(201).json({
        status: "success",
        data: { 
            product: newProduct,
            user: updatedUser
             },
      });
    } catch (err) {
      res.status(400).json({
         status: "fail",
         message: err.message
         });
    }
  };
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getAllProduct = async (req, res) => {
  try {
    const { sortBy = "createdAt", descending = "yes" } = req.query;
    const sortOrder = descending.toLowerCase() === "yes" ? -1 : 1;

    const info = await Product.find({}).sort({ [sortBy]: sortOrder });

    if (!info || info.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No users found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        info,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getProductByText = async (req, res) => {
  // Trim the search text to remove any extra spaces or newlines
  const searchText = req.params.text.trim();

  console.log("Search Text:", searchText); // Debugging: Log the search text

  try {
    const product = await Product.findOne({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { price: !isNaN(searchText) ? Number(searchText) : null }, // Handle price comparison
        { rating: !isNaN(searchText) ? Number(searchText) : null }, // Handle rating comparison
      ].filter(Boolean), // Removes null queries
    });

    console.log("Found Tour:", product); // Debugging: Log the found tour

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    console.error("Error:", err.message); // Debugging: Log any error message
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    return res.status(204).json({
      status: "success",
      message: null,
    });
  } catch (err) {
    return res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};


module.exports = {
  getAllProduct,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductByText,
};

