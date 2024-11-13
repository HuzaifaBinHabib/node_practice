const express = require('express')
const router = express.Router();

const { 
     getCheckoutSessionTour,
     getCheckoutSessionProduct,
     getCheckoutSession,

    } = require('../controlers/bookingController')

const {protect,
    restrictToAdmin,
    restrictToOwner
} = require('../controlers/authController')
const {addToCart
} = require('../controlers/cartController')

router
.route('/checkout-session-tour/:id')
.get(protect,getCheckoutSessionTour)

router
.route('/checkout-session-product/:id')
.get(protect,getCheckoutSessionProduct)
router
.route('/checkout-session')
.get(protect,getCheckoutSession)

router
.route('/add-to-cart')
.post(protect,addToCart)


module.exports = router;