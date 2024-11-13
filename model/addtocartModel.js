const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user :{ 
      type : mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,

    },
    items :[
        {
            product:{
                type : mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity:{
                type:Number,
                deafault:1,
            }

        }
    ]
})

const Cart = mongoose.model('Cart',cartSchema);
module.exports = Cart;