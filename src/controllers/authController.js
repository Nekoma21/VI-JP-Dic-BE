import { authService } from "../services/authService.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/BadRequestError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import NotFoundError from "../errors/NotFoundError.js";

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
    if (err instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
    }
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

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req);
    return res.status(StatusCodes.OK).send({
      message:
        "Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
    }
    next(err);
  }
};

const verifyMailReset = async (req, res, next) => {
  try {
    await authService.verifyMailReset(req);
    return res.status(StatusCodes.OK).send({
      message: "Xác thực liên kết đặt lại mật khẩu thành công.",
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
    }
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req);
    return res
      .status(StatusCodes.OK)
      .send({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
    }
    if (err instanceof BadRequestError) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }
    next(err);
  }
};

export const authController = {
  signUp,
  login,
  verifyEmail,
  refreshToken,
  forgotPassword,
  verifyMailReset,
  resetPassword,
};
