import { authService } from "../services/authService.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/BadRequestError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const signUp = async (req, res, next) => {
  try {
    await authService.signUp(req);
    return res.status(StatusCodes.OK).send({
      message: "Một email đã được gửi đến tài khoản của bạn, vui lòng xác thực",
    });
  } catch (err) {
    if (err instanceof BadRequestError) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req);
    return res.status(StatusCodes.OK).send(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: error.message });
    }
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: error.message });
    }
    next(error);
  }
};

export const authController = {
  signUp,
  login,
  verifyEmail,
  refreshToken,
};
