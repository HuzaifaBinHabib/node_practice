const express = require('express')
const router = express.Router();
const { 
      createUser,
      getUsers,
      getUser,
      updateUser,
      deleteUser,
      getUserbyemail,
      getUserbyText
    } = require('../controlers/userController')
const {protect,restrictToAdmin,restrictToOwner,forgotPassword} = require('../controlers/authController')

router
    .route('/')
    .get(protect,restrictToAdmin(),getUsers)
    .post(protect,restrictToAdmin(),createUser);

router
    .route('/:id')
    .get(protect,restrictToAdmin(),getUser)
    .put(protect,restrictToOwner(),updateUser)
    .delete(protect,restrictToAdmin(),deleteUser)

router
    .route('/:email')
    .get(protect,restrictToAdmin(),getUserbyemail)
    
router
  .route('/forgotPassword')
  .post(forgotPassword);

router
    .route('/:text')
    .get(protect,restrictToAdmin(),getUserbyText)

module.exports = router;