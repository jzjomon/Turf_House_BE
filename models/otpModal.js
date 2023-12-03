const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
});

const otpModal = mongoose.model("otps", otpSchema);

module.exports = otpModal;