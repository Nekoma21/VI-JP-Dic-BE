import express from "express";
import { Auth } from "../middlewares/auth.js";
import { deckController } from "../controllers/deckController.js";

const deckRouter = express.Router();

deckRouter.route("/").get(Auth.UserAuth, deckController.getListDeck);
deckRouter.route("/").post(Auth.UserAuth, deckController.addDeck);
deckRouter.route("/:id").delete(Auth.UserAuth, deckController.deleteDeck);
deckRouter.route("/:id").put(Auth.UserAuth, deckController.updateDeck);
deckRouter.route("/:id").get(Auth.UserAuth, deckController.getTotalCardsInDeck);

export default deckRouter;
