const express = require('express');
const router = express.Router();
const { 
    getAllProduct,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductByText,
  } = require('../controlers/productControler')
  const {protect,restrictToOwner,restrictToAdmin} = require('./../controlers/authController')


router
.route('/')
.get(getAllProduct)
.post(protect,restrictToAdmin(),createProduct)


router
.route('/:id')
.get(getProduct)
.patch(protect,restrictToAdmin(),updateProduct)
.delete(protect,restrictToAdmin(),deleteProduct)

router
    .route('/:text')
    .get(protect,getAllProduct)  

module.exports = router;
