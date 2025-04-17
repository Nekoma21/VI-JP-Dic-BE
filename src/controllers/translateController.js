import { translateService } from "../services/translateService.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/BadRequestError.js";

const detectText = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await translateService.detectText(
      file.buffer,
      file.originalname
    );
    res.status(StatusCodes.OK).send(result);
  } catch (err) {
    if (err instanceof BadRequestError) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }
    next(err);
  }
};

const translate = async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = await translateService.translate(text);
    res.status(StatusCodes.OK).send(result);
  } catch (err) {
    if (err instanceof BadRequestError) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }
    next(err);
  }
};

export const translateController = {
  detectText,
  translate,
};
