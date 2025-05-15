import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./databases/connect.js";
import authRouter from "./routes/authRoutes.js";
import wordRouter from "./routes/wordRoutes.js";
import translateRouter from "./routes/translateRoutes.js";
import fsrsRouter from "./routes/fsrsRoutes.js";
import deckRouter from "./routes/deckRoutes.js";
import cardRouter from "./routes/cardRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import compositionRouter from "./routes/compositionRoutes.js";
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
app.use("/api/v1/words", wordRouter);
app.use("/api/v1/translates", translateRouter);
app.use("/api/v1/fsrs", fsrsRouter);
app.use("/api/v1/decks", deckRouter);
app.use("/api/v1/cards", cardRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/compositions", compositionRouter);

const start = async () => {
  try {
    await connectDB(String(process.env.MONGO_URI));
    app.listen(process.env.PORT, () => {
      console.log(
        `🌐 Server listening at http://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
