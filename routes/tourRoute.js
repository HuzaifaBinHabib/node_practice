const express = require('express');
const router = express.Router();
const { 
    // homepage,
    getAllTour,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    getTourByText,
  } = require('../controlers/tourController')
  const {protect,restrictToOwner,restrictToAdmin} = require('./../controlers/authController')

// PUT replaces the entire resource.
// PATCH updates only the fields specified.

// router
// .route('/home')
// .get(homepage) // html

router
.route('/')
.get(getAllTour)
.post(protect,restrictToAdmin(),createTour)


router
.route('/:id')
.get(getTour)
.patch(protect,restrictToAdmin(),updateTour)
.delete(protect,restrictToAdmin(),deleteTour)

router
    .route('/:text')
    .get(protect,getTourByText)  

module.exports = router;
