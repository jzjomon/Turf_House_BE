const COURT = require('../models/courtModal.js');
const COURT_SCHEDULES = require('../models/courtScheduleModal.js');
const ObjectId = require('mongoose').Types.ObjectId;
const path = require('path');
const USER = require('../models/userModal.js');
const fs = require('fs');


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
                USER.findOne({ _id: req.userId }).then((user) => {
                    res.status(200).json({ message: "success", data: { result, user } });
                }).catch((err) => {
                    res.status(400).json({ message: "cannot find the user" });
                });
            }).catch(err => {
                res.status(401).json({ message: "Something went wrong" });
            })
        } else {
            COURT.find().limit(limit).skip(start).then(result => {
                USER.findOne({ _id: req.userId }).then((user) => {
                    res.status(200).json({ message: "success", data: { result, user } });
                }).catch((err) => {
                    res.status(400).json({ message: "cannot find the user" });
                });
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

const setProfilePic = (req, res) => {
    try {
        const file = req.files.img;
        const imageName = `${Date.now()}-${file.name}`;
        const filePath = path.join(__dirname, '../public/images', imageName);
        USER.findOne({ _id: req.userId }).then(result => {
            if (result.img) {
                const filePathOld = path.join(__dirname, '../public/images', result.img);
                fs.unlink(filePathOld, (err) => {
                    if (err) {
                        res.status(400).json({ message: "Cannot find the old img" });
                    } else {
                        file.mv(filePath, (err) => {
                            if (err) {
                                res.status(400).json({ message: "cannot save the image in server" });
                            } else {
                                USER.findOneAndUpdate({ _id: req.userId }, { img: imageName }, { new: true }).then((result) => {
                                    result.password = null;
                                    res.status(200).json({ message: "Successfully updated", data: result });
                                }).catch((err) => {
                                    res.status(400).json({ message: "Cannot save in database" });
                                });
                            }
                        })
                    }
                })
            } else {
                file.mv(filePath, (err) => {
                    if (err) {
                        res.status(400).json({ message: "cannot save the image" });
                    } else {
                        USER.findOneAndUpdate({ _id: req.userId }, { img: imageName }, { new: true }).then((result) => {
                            result.password = null;
                            res.status(200).json({ message: "Successfully updated", data: result });
                        }).catch((err) => {
                            res.status(400).json({ message: "Cannot save in database" });
                        });
                    }
                })
            }
        }).catch(err => {
            res.status(400).json({ message: "Cannot find this person" });
        })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const deletePic = (req, res) => {
    try {
        USER.findOneAndUpdate({ _id: req.userId }, { img: null }).then((result) => {
            const filePath = path.join(__dirname, "../public/images", result.img);
            fs.unlink(filePath, (err) => {
                if (err) {
                    res.status(400).json({ message: "cannot delete the file" })
                } else {
                    result.img = null;
                    res.status(200).json({ message: "successfully deleted", data: result })
                }
            })
        }).catch((err) => {
            res.status(400).json({ message: "cannot find the person" })
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" })
    }
}

const updateDetails = (req, res) => {
    try {
        USER.findOne({ _id: req.userId }, { firstname: 1, lastname: 1, email: 1, phone: 1, designation: 1, address: 1, _id: 0 }).then((result) => {
            res.status(200)
            if (req.body.firstname) {
                result.firstname = req.body.firstname
            }
            if (req.body.lastname) {
                result.lastname = req.body.lastname
            }
            if (req.body.email) {
                result.email = req.body.email;
            }
            if (req.body.designation) {
                result.designation = req.body.designation;
            }
            if (req.body.address) {
                result.address = req.body.address
            }
            if (req.body.phone) {
                result.phone = req.body.phone
            }
            USER.findOneAndUpdate({ _id: req.userId }, result, { new: true }).then((result) => {
                result.password = null;
                res.status(200).json({ message: "Successfully updated", data: result });
            }).catch((err) => {
                res.status(400).json({ message: "Cannot update the details" });
            });
        }).catch((err) => {
            res.status(400).json({ message: "cannot find the person" });
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const requestVendor = (req, res) => {
    try {
        USER.findOneAndUpdate({ _id: req.userId }, { request: true }, { new: true }).then((result) => {
            res.status(200).json({ message: 'Successfully requested', data: result });
        }).catch((err) => {
            res.status(400).json({ message: "cannot request" })
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const userDetails = (req, res) => {
    try {
        USER.findOne({ _id : req.body.id}).then((result) => {
            res.status(200).json({message :"Successfull", data : result});
        }).catch((err) => {
            res.status(400).json({ message : "cannot find the user"});
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

module.exports = { getCourts, myCourts, getCourt, getSlots, getBookedData, setProfilePic, deletePic, updateDetails, requestVendor, userDetails }
