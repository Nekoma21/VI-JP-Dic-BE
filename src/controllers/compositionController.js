import { StatusCodes } from "http-status-codes";
import { compositionService } from "../services/compositionService.js";

const getCompositionByID = async (req, res, next) => {
  try {
    const result = await compositionService.getCompositionByID(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const compositionController = {
  getCompositionByID,
};
