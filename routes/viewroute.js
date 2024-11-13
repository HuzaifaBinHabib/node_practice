const express = require('express');
const {homepage,paysuccess} = require('../controlers/tourController')
const router = express.Router();


router
.route('/home')
.get(homepage) // html
router
.route('/paysuccess')
.get(paysuccess) // html

module.exports = router;
