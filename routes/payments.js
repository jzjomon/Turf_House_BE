const express = require('express');
const router = express.Router();
const { order, success } = require('../controllers/paymentControllers');
const { userAuth } = require('../middleWares/auth');

router.post('/orders', userAuth, order );
router.post('/success', userAuth, success );

module.exports = router;