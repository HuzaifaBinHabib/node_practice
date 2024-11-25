const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../model/addtocartModel");
const Product = require("../model/productModel");
const Tour = require("../model/tourModel");

const createStripeSession = async (name, description, price, photo, quantity, req, metadata = {}) => {
  try {
    console.log(photo)
    const userEmail = req.user?.email || 'guest@example.com'; // Fallback email
    const clientReferenceId = metadata.client_reference_id || 'unknown';

    return await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${req.protocol}://${req.get("host")}/paysuccess/`,
      cancel_url: `${req.protocol}://${req.get("host")}/home/`,
      customer_email: userEmail,
      client_reference_id: clientReferenceId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name,
              description,
              images: [photo],
            },
            unit_amount: price * 100,
          },
          quantity,
        },
      ],
      mode: "payment",
      metadata,
    });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    throw new Error("Failed to create Stripe session.");
  }
};
// Product Checkout Session
const getCheckoutSessionProduct = async (req, res) => {
  try {
    const { quantity = 1 } = req.body; // Default quantity to 1 if not provided
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }

    const userId = req.user?.id || "guest";

    const session = await createStripeSession(
      product.name,
      product.summary,
      product.price,
      product.photo || "https://example.com/default-product-image.jpg",
      quantity,
      req,
      { userId, productId: req.params.id }
    );

    res.status(200).json({ status: "success", session });
  } catch (error) {
    console.error("Error in product checkout session:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};


// Tour Checkout Session
const getCheckoutSessionTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ status: "error", message: "Tour not found" });
    }

    const userId = req.user?.id || 'guest';

    const session = await createStripeSession(
      tour.name,
      tour.summary,
      tour.price,
      tour.photo || "https://example.com/default-tour-image.jpg",
      1,
      req,
      { userId, tourId: req.params.id }
    );

    res.status(200).json({ status: "success", session });
  } catch (error) {
    console.error("Error in tour checkout session:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Cart Checkout Session
// const getCheckoutSession = async (req, res) => {
//   try {
//     // Find the cart for the logged-in user

//         if (!req.user || !req.user.id) {
//           return res.status(401).json({ status: 'error', message: 'User is not authenticated' });
//         }
    
//         const cart = await Cart.findOne({ userId: req.user.id });
//         if (!cart) {
//           return res.status(404).json({ status: 'error', message: 'Cart not found' });
//         }
    
//         // Proceed with logic to create Stripe session...

    
//     // Check if it's a product or a tour and use appropriate details
//     const line_items = [];

//     if (cart.tourDetails.name) {
//       line_items.push({
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: cart.tourDetails.name,
//             description: cart.tourDetails.description,
//             images: [cart.tourDetails.photo || 'https://example.com/default-product-image.jpg'],
//           },
//           unit_amount: cart.tourDetails.price * 100,
//         },
//         quantity: cart.quantity,
//       });
//     } else if (cart.tourDetails.name) {
//       line_items.push({
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: cart.tourDetails.name,
//             description: cart.tourDetails.description,
//             images: [cart.tourDetails.photo || 'https://example.com/default-tour-image.jpg'],
//           },
//           unit_amount: cart.tourDetails.price * 100,
//         },
//         quantity: cart.quantity,
//       });
//     } else {
//       return res.status(400).json({ status: 'error', message: 'No valid items in cart.' });
//     }

//     // Create Stripe session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       success_url: `${req.protocol}://${req.get('host')}/success`,
//       cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
//       line_items,
//       mode: 'payment',
//     });

//     res.status(200).json({ status: 'success', session });
//   } catch (error) {
//     console.error('Error in cart checkout session:', error);
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// };
const getCheckoutSession = async (req, res) => {
  try {
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'error', message: 'User is not authenticated' });
    }

    // Fetch cart items
    const cartItems = await Cart.find({ userId: req.user.id })
      .populate('itemId'); // Populate the itemId reference (either a Tour or Product)

    // Check if the cart has any items
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Cart is empty' });
    }

    // Prepare line items for Stripe checkout
    const line_items = cartItems.map(cartItem => {
      const item = cartItem.itemId;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: cartItem.itemDetails.name,
            description: cartItem.itemDetails.description,
            images: [cartItem.itemDetails.photo || 'https://example.com/default-image.jpg'],
          },
          unit_amount: cartItem.itemDetails.price * 100, // Convert price to cents
        },
        quantity: cartItem.quantity,
      };
    });

    if (line_items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid items in cart.' });
    }

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
      line_items,
      mode: 'payment',
    });

    res.status(200).json({ status: 'success', session });
  } catch (error) {
    console.error('Error in cart checkout session:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};




module.exports = { getCheckoutSessionProduct, getCheckoutSessionTour, getCheckoutSession };
