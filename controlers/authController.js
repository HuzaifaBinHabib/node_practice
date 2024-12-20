const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from headers
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // Attach user to request
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }
    next();
  } catch (error) {
    // Handle token expiration or invalid token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired' });
    }
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};


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

    req.user = decoded; // Set the userId to the req object
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


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  auth: {
    user: process.env.NODEMAILER_EMAIL, // Replace with your email
    pass: process.env.NODEMAILER_PASSWORD, // Replace with app-specific password if required
  },
});

// Forgot password controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with this email',
      });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = bcrypt.hashSync(resetToken, 10);

    // Save the hashed token and expiry in the user's document
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 1000) // Token valid for 1 day
    await user.save();

    // Construct reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // Send reset email
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset password</p>
      <h4>Tokken : ${resetToken}</h4>
      <p>If you did not request this, please ignore this email.</p>
      `;
      // <p>Click the link below to reset your password:</p>

    await transporter.sendMail({
      from: 'ME&Tours@gmail.com', // Replace with your email
      to: email,
      subject: 'Password Reset Request',
      html: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email',
    });
  } catch (err) {
    console.error('Error in forgotPassword:', err.message);
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Find user by the reset token and ensure it is still valid (check if the token hasn't expired)
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() }, // Token must still be valid
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired reset token',
      });
    }

    // Compare the provided reset token with the hashed token in the DB
    const isTokenValid = bcrypt.compareSync(resetToken, user.passwordResetToken);
    if (!isTokenValid) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid reset token',
      });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    user.password = hashedPassword;
    user.passwordResetToken = undefined; // Remove the reset token after use
    user.passwordResetExpires = undefined; // Clear the expiration
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been successfully reset',
    });
  } catch (err) {
    console.error('Error in resetPassword:', err.message);
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};




module.exports = { authenticateUser,signin, signup, protect ,restrictToAdmin,restrictToAdmin_Seller,restrictToOwner,logout,forgotPassword,resetPassword};
