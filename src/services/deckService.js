import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/NotFoundError.js";
import Deck from "../models/deck.js";

const getListDeck = async (userId) => {
  try {
    const decks = await Deck.find({ createdBy: userId }).sort({
      updatedDate: -1,
    });
    return {
      status: StatusCodes.OK,
      data: decks,
      message: "Lấy danh sách bộ thẻ thành công",
    };
  } catch (error) {
    throw error;
  }
};

const addDeck = async (name, userId) => {
  try {
    const newDeck = new Deck({
      name,
      cardQuantity: 0,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      createdBy: userId,
    });

    await newDeck.save();
    return {
      status: StatusCodes.CREATED,
      data: newDeck,
      message: "Tạo bộ thẻ thành công",
    };
  } catch (error) {
    throw error;
  }
};

const updateDeck = async (id, name, userId) => {
  try {
    const updatedDeck = await Deck.findOneAndUpdate(
      { _id: id, createdBy: userId },
      {
        name,
        updatedDate: new Date().toISOString(),
      },
      { new: true }
    );

    if (!updatedDeck) {
      throw new NotFoundError("Không tìm thấy bộ thẻ để cập nhật");
    }

    return {
      status: StatusCodes.OK,
      data: updatedDeck,
      message: "Cập nhật bộ thẻ thành công",
    };
  } catch (error) {
    throw error;
  }
};

const deleteDeck = async (id, userId) => {
  try {
    const deleted = await Deck.findOneAndDelete({ _id: id, createdBy: userId });

    if (!deleted) {
      throw new NotFoundError(
        "Deck không tồn tại hoặc bạn không có quyền xóa."
      );
    }
    return {
      status: StatusCodes.DELETED,
      message: "Xóa bộ thẻ thành công",
    };
  } catch (error) {
    throw error;
  }
};

const getTotalCardsInDeck = async (deckId, userId) => {
  const total = await Deck.countDocuments({
    deckId,
    createdBy: userId,
  });

  return {
    status: StatusCodes.OK,
    message: "Lấy tổng số thẻ trong bộ thành công",
    totalCards: total,
  };
};

export const deckService = {
  getListDeck,
  addDeck,
  deleteDeck,
  updateDeck,
  getTotalCardsInDeck,
};
