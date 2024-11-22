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
      product.imageUrl || "https://example.com/default-product-image.jpg",
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
      tour.imageUrl || "https://example.com/default-tour-image.jpg",
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
const getCheckoutSession = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ status: "error", message: "Cart is empty" });
    }

    const userId = req.user?.id || 'guest';

    const line_items = cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.summary,
          images: [item.product.imageUrl || "https://example.com/default-product-image.jpg"],
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${req.protocol}://${req.get("host")}/home/`,
      cancel_url: `${req.protocol}://${req.get("host")}/home/`,
      customer_email: req.user?.email || 'guest@example.com',
      client_reference_id: userId,
      line_items,
      mode: "payment",
      metadata: { userId },
    });

    res.status(200).json({ status: "success", session });
  } catch (error) {
    console.error("Error in cart checkout session:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { getCheckoutSessionProduct, getCheckoutSessionTour, getCheckoutSession };
