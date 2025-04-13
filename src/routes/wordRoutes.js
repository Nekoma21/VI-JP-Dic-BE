import express from "express";
import { wordController } from "../controllers/wordController.js";

const wordRouter = express.Router();

wordRouter.route("/").get(wordController.getAllWords);
wordRouter.route("/search").get(wordController.searchWord);
wordRouter.route("/:id").get(wordController.getWordById);

export default wordRouter;
