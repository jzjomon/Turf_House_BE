const mongoose = require('mongoose');
const connectDataBase = async () => {
    try{
        const dbConnect = await mongoose.connect('mongodb://localhost:27017/TurfHouse').then(res => {
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