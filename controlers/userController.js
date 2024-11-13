const userModel = require("../model/userModel");

const createUser = async (req, res) => {
  try {
    const newUser = await userModel.create(req.body);

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: newUser.toObject(),
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getUser = async (req, res) => {
  try {
    const info = await userModel.findById(req.params.id).populate('tours');
    if (!info) {
      res.status(404).json({
        status: "fail",
        message: "Not FOUND",
      });
    }
    res.status(200).json({
      result: {
        user: info.toObject(),
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getUserbyemail = async (req, res) => {
  try {
    const email = req.params.email;
    const info = await userModel.findOne({
      email: email,
    });
    if (!info) {
      res.status(404).json({
        status: "fail",
        message: "Not FOUND",
      });
    }
    res.status(200).json({
      result: {
        user: info.toObject(),
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const remove = await userModel.findByIdAndDelete(req.params.id);
    if (!remove) {
      res.status(404).json({
        status: "fail",
        message: "Not FOUND",
      });
    }
    res.status(200).json({
      result: {
        user: remove.toObject(),
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getUserbyText = async (req, res) => {
  try {
    const searchText = req.params.text;

    // Use the $or operator to search across multiple fields and return a single user
    const user = await userModel.findOne({
      $or: [
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { username: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: user.toObject(), // Convert Mongoose document to plain JavaScript object
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      result: {
        user: updated.toObject(),
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const getUsers = async (req, res) => {
  try {
    const { sortBy = "createdAt", descending = "yes" } = req.query; // Get parameters with default values

    // Set sort order based on 'descending' parameter
    const sortOrder = descending.toLowerCase() === "yes" ? -1 : 1;

    // Perform sorting based on the passed parameters or default values
    const info = await userModel.find({}).sort({ [sortBy]: sortOrder });

    // Handle the case when no users are found
    if (!info || info.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No users found",
      });
    }

    // If the result is a Mongoose document or array of documents / its a ternary function
    const result = Array.isArray(info)
      ? info.map((user) => user.toObject())
      : info.toObject();

    // Send success response
    res.status(200).json({
      status: "success",
      count: info.length,
      result: {
        users: result,
      },
    });
  } catch (err) {
    // Handle any other errors
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserbyText,
  getUserbyemail,
};
