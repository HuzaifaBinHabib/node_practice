const express = require('express')
const router = express.Router();

const { 
     getCheckoutSessionTour,
     getCheckoutSessionProduct,
     getCheckoutSession,

    } = require('../controlers/bookingController')

const {protect,
    restrictToAdmin,
    restrictToOwner,
    authenticateUser
} = require('../controlers/authController')
const {  addToCart,
    getCartItems,
    removeFromCart
} = require('../controlers/cartController')

router
.route('/checkout-session-tour/:id')
.get(getCheckoutSessionTour)

router
.route('/checkout-session-product/:id')
.post(getCheckoutSessionProduct)
router
.route('/checkout-session')
.get(authenticateUser,getCheckoutSession)

// cartRoutes.js



// Add product to cart
router.post('/add-to-cart', addToCart);
router.get('/add-to-cart', getCartItems);

// // Update cart item
// router.patch('add-to-cart/:productId', updateCartItem);

// // Remove product from cart
router.delete('/remove-from-cart/:id', removeFromCart);



module.exports = router;