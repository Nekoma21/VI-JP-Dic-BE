import express from 'express';
import dotenv from 'dotenv';
import connectDB from "./databases/connect.js";

dotenv.config();

const app = express();

const start = async () => {
    try {
        await connectDB(String(process.env.MONGO_URI));
        app.listen(process.env.PORT, () => {
            console.log('Server is running on port ' + process.env.PORT);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

start();
