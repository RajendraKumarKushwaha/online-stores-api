const { default: mongoose } = require("mongoose")
require("dotenv").config();

const mongodburl = process.env.MONGODB_URL;

const connectDb = async ()=>{
    
    try {
        await mongoose.connect(mongodburl);
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

module.exports = connectDb;