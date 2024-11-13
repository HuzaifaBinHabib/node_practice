const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");

const { striptrans } = require('../controlers/webhookControlers');
const { getCheckoutSession } = require('../controlers/bookingController');

// Stripe webhook route (using bodyParser.raw for Stripe)
router.post(
  "/api/stripe/webhook", 
  bodyParser.raw({ type: "application/json" }), 
  striptrans
);


module.exports = router;
