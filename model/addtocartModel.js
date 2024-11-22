const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId,ref:'Tour',ref:'Product', required: true },
  quantity: { type: Number, required: true },
  tourDetails: {
    name: { type: String },
    price: { type: Number },
    description: { type: String },
    photo : { type: String },
    // other tour details
  },
  productDetails: {
    name: { type: String },
    price: { type: Number },
    description: { type: String },
    photo : { type: String },
    // other product details
  },
});

module.exports = mongoose.model('Cart', CartSchema);
