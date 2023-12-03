const nodemailer = require("nodemailer");

module.exports = transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
    },
});