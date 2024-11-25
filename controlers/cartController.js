const Product = require('../model/productModel');
const Tour = require('../model/tourModel');
const Cart = require('../model/addtocartModel');
const User = require('../model/userModel');

const addToCart = async (req, res) => {
  const { userId,itemId, quantity, itemType } = req.body;

  // Validate request body
  if (!itemId || !quantity || !itemType) {
    return res.status(400).json({ error: 'Item ID, quantity, and item type are required' });
  }

  try {
    // Fetch the item based on itemType
    let item;
    if (itemType === 'Tour') {
      item = await Tour.findById(itemId); // Fetch from Tour model
    } else if (itemType === 'Product') {
      item = await Product.findById(itemId); // Fetch from Product model
    } else {
      return res.status(400).json({ error: 'Invalid item type' });
    }

    // Create a new cart item
    const cartItem = new Cart({
      userId,
      itemId,
      itemType,
      quantity,
      itemDetails: {
        name: item.name,
        price: item.price,
        description: item.description,
        photo: item.photo,
      },
    });

    // Save the cart item
    await cartItem.save();

    // Add the cart item to the user's cart array (if needed)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { cart: cartItem._id } }, // Add cart item to the user's cart array
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json({ message: 'Item added to cart successfully', cartItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart', details: err.message });
  }
};


const getCartItems = async (req, res) => {
  try {
    const { sortBy = "createdAt", descending = "yes" } = req.query;
    const sortOrder = descending.toLowerCase() === "yes" ? -1 : 1;

    const cartItems = await Cart.find({}).sort({ [sortBy]: sortOrder });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No items in cart",
      });
    }

    res.status(200).json({
      status: "success",
      data: cartItems,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const removeFromCart= async(req, res) => {

  try {
    const cartItems = await Cart.findByIdAndDelete(req.params.id);
    if (!cartItems) {
      return res.status(404).json({
        status: "fail",
        message: "cart not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "successfully deleted",
    });
  } catch (err) {
    return res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports = {addToCart,getCartItems,removeFromCart};
