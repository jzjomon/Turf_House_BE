var express = require('express');
const { getCourts, myCourts, getCourt, getSlots, getBookedData, setProfilePic, deletePic, updateDetails } = require('../controllers/userControllers');
const auth = require('../middleWares/auth');
const fileUpload = require('express-fileupload');
var router = express.Router();


router.get('/getCourts',auth, getCourts);
router.get('/myCourts', auth, myCourts);
router.get('/getCourt', auth, getCourt);
router.get('/getSlots', auth, getSlots);
router.post('/getBookedData', auth, getBookedData);
router.put('/setProfilePic',fileUpload({createParentPath : true}), auth, setProfilePic);
router.delete('/deletePic', auth, deletePic);
router.patch('/updateDetails', auth, updateDetails)
  
module.exports = router;
 