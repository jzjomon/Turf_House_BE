const USERS = require('../models/userModal');

const isBlocked = (req, res, next) => {
    try {
        USERS.findOne({_id : req.userId}).then((result) => {
            if (result.blocked) {
                res.status(400).json({message : "You have been blocked", blocked : true})
            } else {
                next()
            }
        }).catch((err) => {
            res.status(400).json({message : "Cannot find the user"});
        });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = isBlocked