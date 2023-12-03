const COURT_SCHEDULES = require('../models/courtScheduleModal.js');
const Razorpay = require('razorpay');
const crypto = require("crypto");
const transporter = require('../helppers/nodemailer.js')




const initiateEmail = async (id, razorpayPaymentId) => {
    const slotData = await COURT_SCHEDULES.findOne({ _id: id }).populate("bookedBy").populate("courtId");
    const { date, slot, rate, bookedBy, courtId} = slotData;

    const info = await transporter.sendMail({
        from: "turfhouse", // sender address
        to: bookedBy.email, // list of receivers
        subject: "Succesfully booked court", // Subject line
        text: "", // plain text body
        html: `<b> Hello ${bookedBy.firstname + " " + bookedBy.lastname}</b>
        <p>your booking at ${courtId.name} on ${new Date(date)} at ${slot.time} has been confirmed with payment id ${razorpayPaymentId}<p>`, // html body
    });
}

const order = async (req, res) => {
    try {
        const idArr = await req.body.data.map(ele => {
            return ele;
        })
        const slotData = await COURT_SCHEDULES.find({
            "_id": {
                $in: idArr
            }
        });
        const amount = parseInt(slotData.length * slotData[0].rate);

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",
        };
 
        const order = await instance.orders.create(options);

        if (!order) {
            res.status(500).send("Some error occured");
        } else {
            res.json({ order, idArr });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

const success = async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body.data;
        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature) {
            return res.status(400).json({ msg: "Transaction not legit!" });
        }
        await COURT_SCHEDULES.updateMany({
            "_id": {
                $in: req.body.idArr
            }
        }, { $set: { bookedBy: req.userId }, $push: { paymentOrders: { userId: req.userId, razorpayPaymentId, timeStamp: new Date() } } });
        initiateEmail(req.body.idArr[0], razorpayPaymentId);
        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).send(error);
    }
}

module.exports = { order, success }