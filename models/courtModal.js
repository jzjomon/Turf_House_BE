const mongoose = require('mongoose');

const courtSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userId:{
        type : mongoose.Types.ObjectId,
        ref : 'users'
    },
    location:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    image : {
        type: String,
        required:true
    }
})

const courtModal = mongoose.model('courts',courtSchema);
module.exports = courtModal