const express = require('express');
const { getDash, getRequests, actionReq, getNew, users, blockUnblock, vendors } = require('../controllers/adminControllers');
const { adminAuth } = require('../middleWares/auth');
const router = express.Router();

router.get('/getDash', adminAuth, getDash);
router.get('/getRequests', adminAuth, getRequests);
router.post('/actionReq', adminAuth, actionReq);
router.get('/getNew', adminAuth, getNew);
router.post('/users', adminAuth, users);
router.post('/blockUnblock', adminAuth, blockUnblock);
router.post('/vendors', adminAuth, vendors);

module.exports = router;