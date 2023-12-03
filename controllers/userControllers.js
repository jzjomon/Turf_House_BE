const COURT = require('../models/courtModal.js');
const COURT_SCHEDULES = require('../models/courtScheduleModal.js');
const ObjectId = require('mongoose').Types.ObjectId;


const getCourts = (req, res) => {
    try {
        const search = req.query.searchInput;
        const page = req.query.page;
        const limit = 8;
        const start = (page - 1) * limit;
        if (search) {
            COURT.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { about: { $regex: search, $options: "i" } }
                ]
            }).then(result => {
                res.status(200).json(result);
            }).catch(err => {
                res.status(401).json({ message: "Something went wrong" });
            })
        } else {
            COURT.find().limit(limit).skip(start).then(result => {
                res.status(200).json(result);
            }).catch(err => {
                res.status(401).json({ message: "Something went wrong" });
            })
        }

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

const myCourts = (req, res) => {
    try {
        COURT.find({ userId: req.userId }).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(401).json({ message: "Something went wrong" });
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

const getCourt = (req, res) => {
    try {
        COURT.findOne({ _id: req.query.id }).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(401).json({ message: "Something went wrong" });
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}



const getSlots = (req, res) => {
    try {
        let slotId;
        if (new Date().toISOString().split("T")[0] === new Date(req.query.date).toISOString().split("T")[0]) {
            slotId = parseInt(new Date(req.query.date).getHours());
        } else {
            slotId = 0;
        }
        COURT_SCHEDULES.aggregate([
            {
                $match: {
                    courtId: new ObjectId(req.query.courtId),
                    date: new Date(req.query.date.split("T")[0]),
                    "slot.id": { $gt: slotId }
                }
            },
            {
                $lookup: {
                    from: "courts",
                    localField: "courtId",
                    foreignField: "_id",
                    as: "court"
                }
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    slot: 1,
                    rate: 1,
                    bookedBy: 1,
                    court: { $arrayElemAt: ['$court', 0] }
                }
            }
        ]).then(response => {
            res.status(200).json({ response })
        }).catch(err => {
            res.status(400).json({ message: "Something went wrong" })
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
}

const getBookedData = (req, res) => {
    try {
        const slotId = new Date(req.body.date).getHours();
        const date = new Date(new Date().setUTCHours(0, 0, 0, 0));
        COURT_SCHEDULES.aggregate([
            {
                $match: {
                    bookedBy: new ObjectId(req.userId),
                    $expr: {
                        $or: [
                            { $gt: ["$date", date] },
                            {
                                $and: [
                                    { $eq: ["$date", date] },
                                    { $gt: ["$slot.id", slotId] }
                                ]
                            }
                        ]
                    }
                }
            }, {
                $lookup: {
                    from: "courts",
                    localField: "courtId",
                    foreignField: "_id",
                    as: "court"
                }
            }
        ]).then(upcoming => {
            COURT_SCHEDULES.aggregate([
                {
                    $match: {
                        bookedBy: new ObjectId(req.userId),
                        $expr: {
                            $or: [
                                { $lt: ["$date", date] },
                                {
                                    $and: [
                                        { $eq: ["$date", date] },
                                        { $lt: ["$slot.id", slotId] }
                                    ]
                                }
                            ]
                        }
                    }
                }, {
                    $lookup: {
                        from: "courts",
                        localField: "courtId",
                        foreignField: "_id",
                        as: "court"
                    }
                }
            ]).then(previous => {
                res.status(200).json({ upcoming, previous });
            }).catch(err => {
                res.status(400).json({ message: "Something went wrong !" });
            })
        }).catch(err => {
            res.status(400).json({ message: "Something went wrong !" });
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getCourts, myCourts, getCourt, getSlots, getBookedData } 
