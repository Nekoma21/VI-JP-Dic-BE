// src/controllers/reviewLogController.ts
import { reviewLogService } from "../services/reviewLogService.js";
import { StatusCodes } from "http-status-codes";

const handleReview = async (req, res, next) => {
  try {
    const { cardId, deckId, rating } = req.body;
    const userId = req.user._id;

    if (!cardId || !deckId || !rating || !userId) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
    }

    const result = await reviewLogService.reviewCard({
      cardId,
      deckId,
      rating,
      userId,
    });
    res.status(result.status).json(result);
  } catch (err) {
    next(err);
  }
};

const handleReviewPreview = async (req, res, next) => {
  try {
    const { cardId } = req.body;
    const userId = req.user._id;
    const preview = await reviewLogService.getReviewPreview(cardId, userId);
    res.status(StatusCodes.OK).json(preview);
  } catch (err) {
    next(err);
  }
};

const getTodayCardStats = async (req, res, next) => {
  try {
    const { deckId } = req.body;
    const userId = req.user._id;
    const stats = await reviewLogService.getTodayCardStats(deckId, userId);
    res.status(StatusCodes.OK).json(stats);
  } catch (err) {
    next(err);
  }
};

const getDailyNewCards = async (req, res, next) => {
  try {
    const { deckId } = req.body;
    const userId = req.user._id;
    const dalyNewsCard = await reviewLogService.getDailyNewCards(
      deckId,
      userId
    );
    res.status(StatusCodes.OK).json(dalyNewsCard);
  } catch (err) {
    next(err);
  }
};

const getDecksOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await reviewLogService.getDecksOverview(userId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllDayStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await reviewLogService.getAllDayStats(userId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getTodayAllCard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const stats = await reviewLogService.getTodayAllCard(userId);
    res.status(StatusCodes.OK).json(stats);
  } catch (err) {
    next(err);
  }
};

export const reviewLogController = {
  handleReview,
  handleReviewPreview,
  getTodayCardStats,
  getDailyNewCards,
  getDecksOverview,
  getAllDayStats,
  getTodayAllCard,
};
