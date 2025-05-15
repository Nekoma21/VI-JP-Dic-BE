import { cardService } from "../services/cardService.js";

const createCard = async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const result = await cardService.createCard(req.body, deckId, req.user._id);
    res.status(result.status).send(result);
  } catch (error) {
    next(error);
  }
};

const getCardsByDeck = async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const result = await cardService.getCardsByDeck(deckId, req.user._id);
    res.status(result.status).send(result);
  } catch (error) {
    next(error);
  }
};

const getCardById = async (req, res, next) => {
  try {
    const result = await cardService.getCardById(req.params.id, req.user._id);
    res.status(result.status).send(result);
  } catch (error) {
    next(error);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const result = await cardService.updateCard(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(result.status).send(result);
  } catch (error) {
    next(error);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const result = await cardService.deleteCard(req.params.id, req.user._id);
    res.status(result.status).send(result);
  } catch (error) {
    next(error);
  }
};

export const cardController = {
  createCard,
  getCardsByDeck,
  getCardById,
  updateCard,
  deleteCard,
};
