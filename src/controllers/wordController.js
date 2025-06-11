import { StatusCodes } from "http-status-codes";
import { wordService } from "../services/wordService.js";

const getAllWords = async (req, res, next) => {
  try {
    const words = await wordService.getAllWords(req);

    res.status(StatusCodes.OK).send({
      status: "success",
      data: words,
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/v1/words/{id}
const getWordById = async (req, res, next) => {
  try {
    const result = await wordService.getWordById(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/v1/words/search?text={}
const searchWord = async (req, res, next) => {
  try {
    const result = await wordService.searchWord(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const addNewWord = async (req, res, next) => {
  try {
    const result = await wordService.addNewWord(req);
    return res.status(StatusCodes.CREATED).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateWord = async (req, res, next) => {
  try {
    const result = await wordService.updateWord(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWord = async (req, res, next) => {
  try {
    const result = await wordService.deleteWord(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const wordController = {
  getAllWords,
  getWordById,
  searchWord,
  addNewWord,
  updateWord,
  deleteWord,
};
