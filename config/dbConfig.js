const mongoose = require('mongoose');
const connectDataBase = () => {
    try{
         mongoose.connect(process.env.MONGO_URL).then(res => {
            console.log(`MongoDB Connected`);
        }).catch(err => {
            console.log(`MongoDB Error`);
        })
    }  
    catch (error) {
        console.log(error);
    }
} 
module.exports = connectDataBase    