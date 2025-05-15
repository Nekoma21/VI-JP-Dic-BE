import express from "express";
import { cardController } from "../controllers/cardController.js";
import { Auth } from "../middlewares/auth.js";

const cardRouter = express.Router();

cardRouter.route("/:deckId").post(Auth.UserAuth, cardController.createCard);
cardRouter.route("/:deckId").get(Auth.UserAuth, cardController.getCardsByDeck);
cardRouter.route("/:id").get(Auth.UserAuth, cardController.getCardById);
cardRouter.route("/:id").put(Auth.UserAuth, cardController.updateCard);
cardRouter.route("/:id").delete(Auth.UserAuth, cardController.deleteCard);

export default cardRouter;
