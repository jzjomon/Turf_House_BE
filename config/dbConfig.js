const mongoose = require('mongoose');
const connectDataBase = async () => {
    try{
        const dbConnect = await mongoose.connect('mongodb://127.0.0.1:27017/TurfHouse',{
            useNewUrlParser: true
        })
        console.log(`MongoDB Connected: {conn.connection.host}`);
    }
    catch (error) {
        console.log(error);
    }
}
module.exports = connectDataBase 