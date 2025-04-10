import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./databases/connect.js";
import authRouter from "./routes/authRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1/auth", authRouter);

const start = async () => {
  try {
    await connectDB(String(process.env.MONGO_URI));
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
