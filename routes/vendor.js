const express = require('express');
const auth = require('../middleWares/auth.js');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { addTimings, registerCourt, getLatestDate, getCourtTimeSlotData } = require('../controllers/vendorControllers.js')

router.post('/addTimings', auth, addTimings);
router.post('/register-court', fileUpload({createParentPath: true}), auth, registerCourt); 
router.get('/getLatestDate', auth, getLatestDate);
router.post('/getCourtTimeSlotData', auth, getCourtTimeSlotData)



module.exports = router;