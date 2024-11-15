const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "Strict",
    path: "/", 
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statuscode).json({
    status: "success",
    token,
    data: { user },
  });
};
const signup = async (req, res) => {
  try {
    const newuser = await User.create({
      userName: req.body.userName,
      role: req.body.role,
      email: req.body.email,
      password: req.body.password,
      passwordconfirm: req.body.passwordconfirm,
    });
    createSendToken(newuser, 201, res);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        message: "validation error : " + err.message,
      });
    }
    res.status(400).json({
      status: "fail",
      message: "Unable to register user. Please check the provided data.",
    });
  }
};
const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please log in to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "User recently changed password! Please log in again.",
      });
    }

    req.user = freshUser;
    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "You are not logged in! Please log in to get access.",
      error: err.message,
    });
  }
};
const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide both email and password",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
const logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
  });
  
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
const restrictToAdmin = () => {
  return (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only admin can access this'
      });
    }
    next();
  };
};
const restrictToAdmin_Seller = () => {
  return (req, res, next) => {
    if (req.user.role !== 'admin'||req.user.role !== 'seller') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only admin can access this'
      });
    }
    next();
  };
};
const restrictToOwner = () => {
  return (req, res, next) => {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to perform this action'
      });
    }
    next();
  };
};


module.exports = { signin, signup, protect ,restrictToAdmin,restrictToAdmin_Seller,restrictToOwner,logout};
