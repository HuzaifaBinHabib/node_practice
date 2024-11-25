const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Add reference to User model
  },
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    // itemId will refer to either 'Tour' or 'Product' collection
  },
  itemType: { 
    type: String, 
    enum: ['Tour', 'Product'], 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  itemDetails: {  // Dynamic field to store either Tour or Product details
    name: { type: String },
    price: { type: Number },
    description: { type: String },
    photo: { type: String },
    // other common details
  },
});

module.exports = mongoose.model('Cart', CartSchema);
