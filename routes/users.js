var express = require('express');
const { getCourts, myCourts, getCourt, getSlots, getBookedData, setProfilePic, deletePic, updateDetails, requestVendor, userDetails } = require('../controllers/userControllers');
const fileUpload = require('express-fileupload');
const { userAuth } = require('../middleWares/auth');
const isBlocked = require('../middleWares/blocked');
var router = express.Router();


router.get('/getCourts',userAuth, isBlocked, getCourts);
router.get('/myCourts', userAuth, isBlocked, myCourts);
router.get('/getCourt', userAuth, isBlocked, getCourt);
router.get('/getSlots', userAuth, isBlocked, getSlots);
router.post('/getBookedData', userAuth, isBlocked, getBookedData);
router.put('/setProfilePic',userAuth, isBlocked, fileUpload({createParentPath : true}), setProfilePic);
router.delete('/deletePic', userAuth, isBlocked, deletePic);
router.patch('/updateDetails', userAuth,isBlocked, updateDetails);
router.get('/requestVendor', userAuth, isBlocked, requestVendor);
router.post('/userDetails', userAuth, isBlocked, userDetails);
  
module.exports = router;
 