const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ');
        jwt.verify(token[1], process.env.TOKENPASS, (err, data) => {
            if (data) {
                req.userId = data?.userData._id;
                next();
            } else {
                res.status(401).json({ auth : false});
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const vendorAuth = (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ');
        jwt.verify(token[1], process.env.TOKENPASS, (err, data) => {
            if (data?.userData?.role === 2 || data?.userData?.role === 3) {
                req.userId = data?.userData._id;
                next();
            } else {
                res.status(401).json({ message : "Authentication faild", auth : false});
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const adminAuth = (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ');
        jwt.verify(token[1], process.env.TOKENPASS, (err, data) => {
            if (data?.userData?.role === 3) {
                req.userId = data?.userData._id;
                next();
            } else {
                res.status(401).json({ auth : false});
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {userAuth, vendorAuth, adminAuth};