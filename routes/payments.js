const express = require('express');
const router = express.Router();
const auth = require('../middleWares/auth');
const { order, success } = require('../controllers/paymentControllers');

router.post('/orders', auth, order );
router.post('/success', auth, success );

module.exports = router;