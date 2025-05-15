import { fsrs, generatorParameters, Rating } from "ts-fsrs";
import Card from "../models/card.js";
import ReviewLog from "../models/reviewlog.js";
import { StatusCodes } from "http-status-codes";
import { startOfDay, endOfDay, endOfYear, format } from "date-fns";
import Deck from "../models/deck.js";
import mongoose from "mongoose";

const reviewCard = async ({ cardId, deckId, userId, rating }) => {
  const cardDoc = await Card.findOne({ _id: cardId, createdBy: userId });
  if (!cardDoc) throw new Error("Không tìm thấy thẻ");

  // Mapping từ DB sang định dạng ts-fsrs card
  const card = {
    due: cardDoc.due,
    stability: cardDoc.stability,
    difficulty: cardDoc.difficulty,
    elapsed_days: cardDoc.elapsed_days,
    scheduled_days: cardDoc.scheduled_days,
    reps: cardDoc.reps,
    lapses: cardDoc.lapses,
    state: cardDoc.state,
    last_review: cardDoc.last_review,
  };

  const now = new Date();
  const ratingEnum = {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  }[rating];

  const f = fsrs(
    generatorParameters({ enable_fuzz: true, enable_short_term: true })
  );
  const result = f.next(card, now, ratingEnum);
  const { card: updatedCard, log } = result;

  // Cập nhật card
  await Card.updateOne(
    { _id: cardId },
    {
      $set: {
        ...updatedCard,
        last_review: updatedCard.last_review ?? now,
      },
    }
  );

  // Tạo review-log mới
  await ReviewLog.create({
    difficulty: log.difficulty,
    due: log.due,
    elapsed_days: log.elapsed_days,
    last_elapsed_days: log.last_elapsed_days,
    rating: log.rating,
    review: log.review,
    scheduled_days: log.scheduled_days,
    stability: log.stability,
    state: log.state,
    deckId,
    cardId,
    createdBy: userId,
  });

  const updatedDoc = await Card.findOne({ _id: cardId });

  return {
    status: StatusCodes.OK,
    message: "Đã ghi nhận đánh giá và cập nhật card",
    card: updatedDoc,
  };
};

const getReviewPreview = async (cardId, userId) => {
  const cardDoc = await Card.findOne({ _id: cardId, createdBy: userId });
  if (!cardDoc) throw new Error("Không tìm thấy thẻ");

  const now = new Date();
  const card = {
    due: cardDoc.due,
    stability: cardDoc.stability,
    difficulty: cardDoc.difficulty,
    elapsed_days: cardDoc.elapsed_days,
    scheduled_days: cardDoc.scheduled_days,
    reps: cardDoc.reps,
    lapses: cardDoc.lapses,
    state: cardDoc.state,
    last_review: cardDoc.last_review,
  };

  const f = fsrs(
    generatorParameters({ enable_fuzz: true, enable_short_term: true })
  );
  const again = f.next(card, now, Rating.Again).card.due;
  const hard = f.next(card, now, Rating.Hard).card.due;
  const good = f.next(card, now, Rating.Good).card.due;
  const easy = f.next(card, now, Rating.Easy).card.due;

  const preview = {
    Again: formatTimeDiff(again),
    Hard: formatTimeDiff(hard),
    Good: formatTimeDiff(good),
    Easy: formatTimeDiff(easy),
  };

  return preview;
};

const formatTimeDiff = (dueDate, now = new Date()) => {
  const diffMs = dueDate - now;
  const diffMinutes = diffMs / 1000 / 60;

  if (diffMinutes < 60) {
    return `${diffMinutes.toFixed(1)}m`;
  }

  const diffHours = diffMinutes / 60;
  if (diffHours < 24) {
    return `${diffHours.toFixed(1)}h`;
  }

  const diffDays = diffHours / 24;
  if (diffDays < 30) {
    return `${diffDays.toFixed(1)}d`;
  }

  const diffMonths = diffDays / 30.4375;
  if (diffMonths < 12) {
    return `${diffMonths.toFixed(1)}mo`;
  }

  const diffYears = diffMonths / 12;
  return `${diffYears.toFixed(1)}y`;
};

const getTodayCardStats = async (deckId, userId) => {
  const now = new Date();
  const todayEnd = endOfDay(now);

  const cards = await Card.find({
    deckId,
    createdBy: userId,
    due: { $lte: todayEnd },
  });

  const cardLearns = await Card.find({
    deckId,
    createdBy: userId,
  });

  const stats = {
    new: 0,
    learning: 0,
    review: 0,
  };

  for (const card of cards) {
    if (card.state === 2) stats.review += 1;
  }

  for (const card of cardLearns) {
    if (card.state === 1 || card.state == 3) stats.learning += 1;
    if (card.state === 0) stats.new += 1;
  }

  if (stats.new >= 25) stats.new = 25;
  return stats;
};

const getTodayAllCard = async (userId) => {
  const cards = await Card.find({
    createdBy: userId,
  });

  const cardLearns = await Card.find({
    createdBy: userId,
  });

  const stats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
  };

  for (const card of cards) {
    if (card.state === 2) stats.review += 1;
  }

  for (const card of cardLearns) {
    if (card.state === 1 || card.state == 3) stats.learning += 1;
    if (card.state === 0) stats.new += 1;
  }

  if (stats.new >= 25) stats.new = 25;
  return stats;
};

const getTodayCards = async (deckId, userId) => {
  const now = new Date();
  const todayEnd = endOfDay(now);

  const learningCards = await Card.find({
    deckId,
    createdBy: userId,
    state: { $in: [1, 3] },
  })
    .sort({ due: 1 })
    .lean();

  const reviewCards = await Card.find({
    deckId,
    createdBy: userId,
    state: 2,
    due: { $lte: todayEnd },
  })
    .sort({ due: 1 })
    .lean();

  const newCards = await Card.find({
    deckId,
    createdBy: userId,
    state: 0,
  })
    .sort({ createdAt: 1 })
    .limit(25)
    .lean();

  const mergedCards = [];
  let l = 0,
    r = 0,
    n = 0;

  while (
    l < learningCards.length ||
    r < reviewCards.length ||
    n < newCards.length
  ) {
    for (let i = 0; i < 5 && l < learningCards.length; i++)
      mergedCards.push(learningCards[l++]);
    for (let i = 0; i < 5 && r < reviewCards.length; i++)
      mergedCards.push(reviewCards[r++]);
    if (n < newCards.length) mergedCards.push(newCards[n++]);
  }

  return mergedCards;
};

const getDecksOverview = async (userId) => {
  const decks = await Deck.find({ createdBy: userId });

  const result = await Promise.all(
    decks.map(async (deck) => {
      const stats = await getTodayCardStats(deck._id, userId);
      const cards = await getTodayCards(deck._id, userId);
      const total = await Card.countDocuments({
        deckId: deck._id,
        createdBy: userId,
      });

      return {
        id: deck._id.toString(),
        name: deck.name,
        new: stats.new,
        learn: stats.learning,
        due: stats.review,
        total,
        cards,
      };
    })
  );

  return result;
};

const getDailyNewCards = async (deckId, userId) => {
  const newCards = await Card.find({
    deckId,
    createdBy: userId,
    state: 0,
  })
    .sort({ createdAt: 1 })
    .limit(20);

  return newCards;
};

const getAllDayStats = async (userId) => {
  const firstDay = startOfDay(new Date(2025, 0, 1));
  const today = new Date();
  const endYear = endOfYear(today);

  const rawStats = await ReviewLog.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
        review: { $gte: firstDay, $lte: endYear },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$review" },
        },
        uniqueCards: { $addToSet: "$cardId" },
      },
    },
    {
      $project: {
        date: "$_id",
        count: { $size: "$uniqueCards" },
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);

  const statMap = rawStats.reduce((map, { date, count }) => {
    map[date] = count;
    return map;
  }, {});

  const result = [];
  for (
    let dt = new Date(firstDay);
    dt <= endYear;
    dt.setDate(dt.getDate() + 1)
  ) {
    const dayStr = format(dt, "yyyy-MM-dd");
    result.push({ date: dayStr, count: statMap[dayStr] || 0 });
  }

  return result;
};

export const reviewLogService = {
  reviewCard,
  getReviewPreview,
  getTodayCardStats,
  getDailyNewCards,
  getTodayCards,
  getDecksOverview,
  getAllDayStats,
  getTodayAllCard,
};
