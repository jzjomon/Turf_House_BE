var express = require('express');
const { signUp, login, getOtp, tryOtp, resetPass } = require('../controllers/authControllers');
var router = express.Router();

/* GET home page. */
router.post('/signup',signUp);
router.post('/login', login);
router.post('/getOtp', getOtp);
router.post('/tryOtp', tryOtp);
router.post('/resetPass', resetPass);

module.exports = router;
