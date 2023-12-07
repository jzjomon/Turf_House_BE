const COURT_SCHEDULES = require('../models/courtScheduleModal.js');
const COURT = require("../models/courtModal.js")
const path = require('path');
const { default: mongoose } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const registerCourt = (req, res) => {
    try {
        const files = req.files.img;
        const imageName = `${Date.now()}-${files.name}`;
        const filePath = path.join(__dirname, '../public/images', imageName);
        files.mv(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: " Something went wrong" })
            } else {
                COURT({ name: req.query.courtName, userId: req.userId, location: req.query.location, about: req.query.about, image: imageName }).save().then((result) => {
                    res.status(200).json({ message: "Court registered successfully" })
                }).catch((err) => {
                    res.status(500).json({ message: "Something went wrong" })
                });
            }
        })
    }
    catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

const getLatestDate = (req, res) => {
    try {
        COURT_SCHEDULES.find({ courtId: req.query.courtId }).sort({ date: -1 }).then(response => {
            res.status(200).json({ latestDate: new Date(response[0]?.date?.setDate(response[0]?.date?.getDate() + 1)) });
        }).catch(error => {
            console.log(error);
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

const addTimings = (req, res) => {
    try {

        let startDate = new Date(req.body.data.date.startDate);
        let endDate = new Date(req.body.data.date.endDate);
        const timingObj = [];
        while (startDate <= endDate) {
            req.body.data.schedules.forEach(obj => {
                timingObj.push({
                    date: JSON.parse(JSON.stringify(startDate)),
                    slot: {
                        time: obj.time,
                        id: obj.id
                    },
                    rate: req.body.data.rate,
                    courtId: req.body.data.courtId
                });
            });
            startDate.setDate(startDate.getDate() + 1);
        };
        COURT_SCHEDULES.insertMany(timingObj).then(response => {
            res.status(200).json({ message: "success" });
        }).catch(err => {
            res.status(400).json({ message: err.message });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getCourtTimeSlotData = (req, res) => {
    try {
        COURT_SCHEDULES.aggregate([
            {
                $match: {
                    courtId: new ObjectId(req.body.id),
                    date: { $gt: new Date() }
                },
            }, {
                $group: {
                    _id: "$date",
                    slotData: { $push: { slot: "$slot", rate: "$rate", } }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }
        ]).then(response => {
            res.status(200).json(response);
        }).catch(err => {
            res.status(400).json({ message: err.message });
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const editCourt = (req, res) => {
    try {
        COURT.findOneAndUpdate({ _id: req.body._id }, { name: req.body.name, location: req.body.location, about: req.body.about }).then(result => {
            res.status(200).json({message : "Court details updated"})
        }).catch(err => {
            res.status(400).json({message : "Cannot update court details"}); 
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

module.exports = { addTimings, getLatestDate, registerCourt, getCourtTimeSlotData, editCourt }