const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { addTimings, registerCourt, getLatestDate, getCourtTimeSlotData, editCourt } = require('../controllers/vendorControllers.js');
const { vendorAuth } = require('../middleWares/auth.js');
const isBlocked = require('../middleWares/blocked.js');

router.post('/addTimings', vendorAuth, isBlocked, addTimings);
router.post('/register-court',vendorAuth,isBlocked, fileUpload({createParentPath: true}),  registerCourt); 
router.get('/getLatestDate', vendorAuth,isBlocked, getLatestDate);
router.post('/getCourtTimeSlotData', vendorAuth, isBlocked, getCourtTimeSlotData);
router.patch('/editCourt',vendorAuth, isBlocked, editCourt);



module.exports = router;