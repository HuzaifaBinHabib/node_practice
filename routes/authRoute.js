const express = require("express");
const router = express.Router();
const { signin, signup ,logout} = require("./../controlers/authController");

router.route("/signin").post(signin);

router.route("/signup").post(signup);

router.route("/logout").post(logout);

module.exports = router;
