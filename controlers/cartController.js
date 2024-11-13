const mongoose = require('mongoose');
const Cart = require('../model/addtocartModel');

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ status: 'error', message: 'Product ID is required' });
    }

    // Check if productId is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid product ID' });
    }

    // Parse `quantity` or set a default value
    const validQuantity = quantity && Number.isInteger(quantity) ? quantity : 1;

    // Find or create the user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({
        user: new mongoose.Types.ObjectId(req.user.id), // Use `new` here
        items: [{ product: new mongoose.Types.ObjectId(productId), quantity: validQuantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += validQuantity;
      } else {
        cart.items.push({ product: new mongoose.Types.ObjectId(productId), quantity: validQuantity }); // Use `new` here
      }
      await cart.save();
    }

    res.status(200).json({ status: 'success', cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { addToCart };
