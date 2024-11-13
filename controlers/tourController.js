const Tour = require("../model/tourModel");
const User = require('../model/userModel'); // Ensure correct import

const createTour = async (req, res) => {
  try {
    // Step 1: Create the new tour
    const Tourdata = {
      ...req.body,
      userId: req.user._id, // userId from the authenticated user
    };
    const newTour = await Tour.create(Tourdata);

    // Step 2: Find the user and update the tours array by pushing the new tour's ID
    const updatedUser = await User.findByIdAndUpdate(
      req.body.userId, // Assuming `userId` is sent in the request body
      { $push: { tours: newTour._id } }, // Add the new tour ID to the user's tours array
      { new: true, runValidators: true } // Return the updated user and ensure validation
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Step 3: Send response with success
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
        user: updatedUser,
      },
    });
  } catch (err) {
    // Handle errors
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getAllTour = async (req, res) => {
  try {
    const { sortBy = "createdAt", descending = "yes" } = req.query;
    const sortOrder = descending.toLowerCase() === "yes" ? -1 : 1;

    const info = await Tour.find({}).sort({ [sortBy]: sortOrder });

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
const getTourByText = async (req, res) => {
  // Trim the search text to remove any extra spaces or newlines
  const searchText = req.params.text.trim();

  console.log("Search Text:", searchText); // Debugging: Log the search text

  try {
    const tour = await Tour.findOne({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { price: !isNaN(searchText) ? Number(searchText) : null }, // Handle price comparison
        { rating: !isNaN(searchText) ? Number(searchText) : null }, // Handle rating comparison
      ].filter(Boolean), // Removes null queries
    });

    console.log("Found Tour:", tour); // Debugging: Log the found tour

    if (!tour) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        tour,
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
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
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
const homepage = async (req, res) => {
  res.status(200).render("overview", {
    title: "Overview Page",
    message: "Welcome to the overview page!",
  });
};
const paysuccess = async (req, res) => {
  res.status(200).render("overview", {
    title: "Payment Page",
    message: "Payment Successfull",
  });
};

module.exports = {
  homepage,
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourByText,
  paysuccess,
};

