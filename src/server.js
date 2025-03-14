const app = require(".");
require("dotenv").config(); 
const connectDb = require("./config/db"); 

const PORT = process.env.PORT || 6000;

const startServer = async () => {
    try {
        await connectDb(); 
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log("Ecommerce API listening on PORT:", PORT);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
};

startServer();
