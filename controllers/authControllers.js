const USER = require('../models/userModal');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const transporter = require('../helppers/nodemailer.js');
const OTP = require('../models/otpModal.js');

const signUp = (req, res) => {
    try {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                res.status(500).json({ error: true });
            } else {
                USER.findOne({ email: req.body.email }).then((result) => {
                    if (result) {
                        res.status(500).json({ exist: true })
                    } else {
                        USER({ firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email, password: hash }).save().then((result) => {
                            res.status(200).json({ success: true });
                        }).catch((err) => {
                            res.status(500).json({ error: true })
                        });
                    }
                }).catch((err) => {
                    res.status(500).json({ error: true })
                }); 
            }
        })
    }
    catch (err) {
        res.status(500).json({ error: true })
    }
}

const login =  (req, res) => {
    try {
        USER.findOne({ email: req.body.email }).then(data => {
            bcrypt.compare(req.body.password, data.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ userData : data},process.env.TOKENPASS ,{
                        expiresIn:"3d"
                    });
                    data.password = null;
                    res.status(200).json({ token: token , data});
                } else {
                    res.status(500).json({ password: true });
                }
            })
        }).catch(err => {
            res.status(500).json({ exist: true })
        })
    }
    catch (err) {
        res.status(500).json({ error: true });     
    }
}
const getOtp = (req, res) => {
    try {
        const email = req.body.email;
       const otp = otpGenerator.generate(4);
       OTP({otp : otp, email}).save().then( async response => {
           await transporter.sendMail({
            from: "turfhouse", // sender address
            to: email, // list of receivers
            subject: "Password reset", // Subject line
            html : `<span><span style="font-weight : bold;">${otp} </span> this is your OTP.  OTP is valid for 10 mins.</span>`
           })
           res.status(200).json({message : "OTP Send"});
           setTimeout(() => {
            OTP.deleteOne({email}).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
            })
           }, 600000);
       }).catch(err => {
        res.status(401).json({message : "Something went wrong !"})
       })

    } catch (error) {
        res.status(500).json({ message : "Something went wrong !"});
    }
}

const tryOtp = (req, res) => {
    try {
        OTP.findOne({email : req.body.email, otp : req.body.otp}).then(response => {
            res.status(200).json({ message : "reset password"})
        }).catch(err => {
            res.status(400).json({message : "otp not valid !"})
        })
    } catch (error) {
        res.status(500).json({message : "Something went wrong !"});
    }
}
 
const resetPass = (req,res) => {
    try {
        bcrypt.hash(req.body.pass, 10, (err, hash) => {
           if (err) {
            res.status(400).json({message : "Something went wrong !"});
           } else {
            USER.findOneAndUpdate({email : req.body.email},{ password : hash }).then(response => {
                res.status(200).json({message : "Password reseted successfully"});
            }).catch(err => {
                res.status(401).json({message : "Something went wrong !"});
            })
           }
        })
    } catch (error) {
        res.status(500).json({message : "Something went wrong !"});
    }
}

module.exports = { signUp, login, getOtp, tryOtp, resetPass }