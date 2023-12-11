const USERS = require('../models/userModal');
const COURTS = require('../models/courtModal');

const getDash = (req, res) => {
    try {
        USERS.find({role : 1}).count().then((users) => {
            COURTS.count().then((courts) => {
                USERS.find({ role: 2 }).count().then((vendors) => {
                    USERS.find({ request: true }).count().then((requestes) => {
                        res.status(200).json({ message: "success", data: { users, courts, vendors, requestes } });
                    }).catch((err) => {
                        res.status(400).json({ message: "cannot find the requestes" })
                    });
                }).catch((err) => {
                    res.status(400).json({ message: "cannot find the vendors" })
                });
            }).catch((err) => {
                res.status(400).json({ message: "cannot find the courts" })
            });
        }).catch((err) => {
            res.status(400).json({ message: "Cannot find the users" })
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const getRequests = (req, res) => {
    try {
        USERS.find({ request: true }).then((result) => {
            res.status(200).json({ message: "Successfull", data: result });
        }).catch((err) => {
            res.status(400).json({ message: "cannot find the requests" });
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const actionReq = (req, res) => {
    try {
        if (req.body.action === "accept") {
            USERS.findOneAndUpdate({ _id: req.body.id }, { role: 2, request: false }, { new: true }).then((result) => {
                res.status(200).json({ message: "Successfull", data: result });
            }).catch((err) => {
                res.status(400).json({ message: "cannot find the user" });
            });
        } else {
            USERS.findOneAndUpdate({ _id: req.body.id }, { request: false }, { new: true }).then((result) => {
                res.status(200).json({ message: "Successfull", data: result });
            }).catch((err) => {
                res.status(400).json({ message: "cannot find the user" });
            });
        }

    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const getNew = (req, res) => {
    try {
        COURTS.find().sort({ createdAt: -1 }).limit(4).populate('userId').then((courts) => {
            USERS.find().sort({ createdAt: -1 }).limit(4).then((users) => {
                res.status(200).json({ message: "Success", data: { courts, users } });
            }).catch((err) => {
                res.status(400).json({ message: "cannot find the users" })
            });
        }).catch((err) => {
            res.status(400).json({ message: "Cannot find the courts " })
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const users = (req, res) => {
    try {
        const page = req.body.page;
        const limit = 8;
        const skip = (page - 1) * limit;
        USERS.find({role : 1}).limit(limit).skip(skip).then((result) => {
            res.status(200).json({ message: "success", data: result })
        }).catch((err) => {
            res.status(400).json({ message: "cannot find the users" });
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const blockUnblock = (req, res) => {
    try {
        if (req.body.action === "block") {
            USERS.findOneAndUpdate({ _id: req.body.id }, { blocked: true }).then((result) => {
                res.status(200).json({message : "successfully blocked"})
            }).catch((err) => {
                res.status(400).json({message : "cannot find the user"})
            });
        } else {
            USERS.findOneAndUpdate({ _id : req.body.id}, { blocked : false}).then((result) => {
                res.status(200).json({message : "successfully unblocked"})
            }).catch((err) => {
                res.status(400).json({message : "cannot find the user"});
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

const vendors = (req, res) => {
    try {
        const page = req.body.page;
        const limit = 8;
        const skip = (page - 1) * limit;
        USERS.find({role : 2}).limit(limit).skip(skip).then((result) => {
            res.status(200).json({ message: "success", data: result });
        }).catch((err) => {
            res.status(400).json({message : "cannot find the courts"});
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong !" });
    }
}

module.exports = { getDash, getRequests, actionReq, getNew, users, blockUnblock, vendors }