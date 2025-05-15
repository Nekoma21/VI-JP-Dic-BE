import { StatusCodes } from "http-status-codes";
import { deckService } from "../services/deckService.js";
import NotFoundError from "../errors/NotFoundError.js";

const getListDeck = async (req, res, next) => {
  try {
    const result = await deckService.getListDeck(req.user._id);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

const addDeck = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;
    const result = await deckService.addDeck(name, userId);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

const updateDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;
    const result = await deckService.updateDeck(id, name, userId);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

const deleteDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await deckService.deleteDeck(id, userId);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    if (err instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
    }
    next(error);
  }
};

const getTotalCardsInDeck = async (req, res, next) => {
  const { deckId } = req.params;
  const userId = req.user._id;

  try {
    const result = await deckService.getTotalCardsInDeck(deckId, userId);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

export const deckController = {
  getListDeck,
  addDeck,
  deleteDeck,
  updateDeck,
  getTotalCardsInDeck,
};
