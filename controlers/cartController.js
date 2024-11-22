const Product = require('../model/productModel'); // Assuming you have a Product model
const Tour = require('../model/tourModel'); // Assuming you have a Product model
const Cart = require('../model/addtocartModel'); // Your Cart model

// Add to cart API
// const addToCart = async (req, res) => {
//   const { tourId, quantity } = req.body;

//   // Validate request body
//   if (!tourId || !quantity) {
//     return res.status(400).json({ error: 'ProductId and quantity are required' });
//   }

//   try {
//     // Fetch product details using productId
//     const product = await Product.findById(productId);
//     const tour = await Tour.findById(tourId);

//     if (!tour) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }


//     // Create a cart item with product details
//     const cartItem = new Cart({
//       tourId,
//       quantity,
//       tourDetails: {
//         name: tour.name,
//         price: tour.price,
//         description: tour.description,
//         photo: tour.photo,
//         // add any other tour details you want
//       },
//       productDetails: {
//         name: product.name,
//         price: product.price,
//         description: product.description,
//         photo: product.photo,
//         // add any other product details you want
//       },
//     });

//     await cartItem.save();
//     res.status(201).json({ message: 'Item added to cart successfully', cartItem });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add item to cart', details: err.message });
//   }
// };
const addToCart = async (req, res) => {
  const { itemId, quantity } = req.body;

  // Validate request body
  if (!itemId || !quantity) {
    return res.status(400).json({ error: 'TourId and quantity are required' });
  }

  try {
    // Fetch tour details using tourId
    let tour = await Tour.findById(itemId);

    if (!tour) {
      tour = await Product.findById(itemId);
    }

    // Create a cart item with tour details
    const cartItem = new Cart({
      itemId,
      quantity,
      tourDetails: {
        name: tour.name,
        price: tour.price,
        description: tour.description,
        photo: tour.photo,
        // add any other tour details you want
      },
    });

    await cartItem.save();
    res.status(201).json({ message: 'Item added to cart successfully', cartItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add tour to cart', details: err.message });
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



module.exports = {addToCart,getCartItems};
