import { StatusCodes } from "http-status-codes";
import { kanjiService } from "../services/kanjiService.js";

const getAllKanjis = async (req, res, next) => {
  try {
    const kanjis = await kanjiService.getAllKanjis(req);
    res.status(StatusCodes.OK).send({
      status: "success",
      data: kanjis,
    });
  } catch (error) {
    next(error);
  }
};

const addNewKanji = async (req, res, next) => {
  try {
    const result = await kanjiService.addNewKanji(req);
    return res.status(StatusCodes.CREATED).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateKanji = async (req, res, next) => {
  try {
    const result = await kanjiService.updateKanji(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteKanji = async (req, res, next) => {
  try {
    const result = await kanjiService.deleteKanji(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const kanjiController = {
  getAllKanjis,
  addNewKanji,
  updateKanji,
  deleteKanji,
};
