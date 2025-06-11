import express from "express";
import { wordController } from "../controllers/wordController.js";
import { Auth } from "../middlewares/auth.js";

const wordRouter = express.Router();

wordRouter.route("/").get(Auth.AdminAuth, wordController.getAllWords);
wordRouter.route("/search").get(wordController.searchWord);
wordRouter.route("/:id").get(wordController.getWordById);
wordRouter.route("/").post(Auth.AdminAuth, wordController.addNewWord);
wordRouter.route("/:id").put(Auth.AdminAuth, wordController.updateWord);
wordRouter.route("/:id").delete(Auth.AdminAuth, wordController.deleteWord);

export default wordRouter;
