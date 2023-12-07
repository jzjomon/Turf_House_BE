const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role : {
        type: Number,
        default: 1
    },
    img : String,
    phone : {
        type : String,
        default : null
    },
    designation :{
        type : String,
        default : null
    },
    address : {
        type : String,
        default : null
    }
})

const userModal = mongoose.model('users',userSchema);
module.exports = userModal