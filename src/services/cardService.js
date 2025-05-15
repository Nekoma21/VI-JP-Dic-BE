import Card from "../models/card.js";
import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/NotFoundError.js";

const createCard = async (cardData, deckId, userId) => {
  const newCard = new Card({
    ...cardData,
    deckId,
    createdBy: userId,
  });
  await newCard.save();

  return {
    status: StatusCodes.CREATED,
    data: newCard,
    message: "Tạo thẻ thành công",
  };
};

const getCardsByDeck = async (deckId, userId) => {
  const cards = await Card.find({ deckId, createdBy: userId });
  if (!cards) throw new NotFoundError("Không tìm thấy thẻ");
  return {
    status: StatusCodes.OK,
    data: cards,
    message: "Lấy danh sách thẻ thành công",
  };
};

const getCardById = async (id, userId) => {
  const card = await Card.findOne({ _id: id, createdBy: userId });
  if (!card) throw new NotFoundError("Không tìm thấy thẻ");
  return {
    status: StatusCodes.OK,
    data: card,
    message: "Lấy thông tin thẻ thành công",
  };
};

const updateCard = async (id, updateData, userId) => {
  const updated = await Card.findOneAndUpdate(
    { _id: id, createdBy: userId },
    updateData,
    { new: true }
  );
  if (!updated) throw new NotFoundError("Không tìm thấy thẻ để cập nhật");
  return {
    status: StatusCodes.OK,
    data: updated,
    message: "Cập nhật thẻ thành công",
  };
};

const deleteCard = async (id, userId) => {
  const deleted = await Card.findOneAndDelete({ _id: id, createdBy: userId });
  if (!deleted) throw new NotFoundError("Không tìm thấy thẻ để xoá");
  return {
    status: StatusCodes.OK,
    data: deleted,
    message: "Xoá thẻ thành công",
  };
};

export const cardService = {
  createCard,
  getCardsByDeck,
  getCardById,
  updateCard,
  deleteCard,
};
