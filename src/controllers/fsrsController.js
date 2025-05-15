import { StatusCodes } from "http-status-codes";
import { fsrsService } from "../services/fsrsService.js";

const demoFsrs = async (req, res, next) => {
  try {
    const result = await fsrsService.demoFsrs();

    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

export const fsrsController = {
  demoFsrs,
};
