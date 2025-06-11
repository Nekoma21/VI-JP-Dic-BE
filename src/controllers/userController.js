import { StatusCodes } from "http-status-codes";
import { userService } from "../services/userService.js";
import NotFoundError from "../errors/NotFoundError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import BadRequestError from "../errors/BadRequestError.js";

const getUser = async (req, res, next) => {
  try {
    const result = await userService.getUserInfo(req.user._id);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

const updateUserName = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user._id;
    const result = await userService.changeUsername(userId, username);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updateData = req.body;
    const userId = req.user._id;
    const result = await userService.updateUserInfo(userId, updateData);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    next(error);
  }
};

const changePass = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: error.message });
    }
    if (error instanceof UnauthorizedError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: error.message });
    }
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const avtPath = req.file.path;
    const result = await userService.updateUserAvatar(userId, avtPath);
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: error.message });
    }
    if (error instanceof BadRequestError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: error.message });
    }
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req);
    return res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  getUser,
  updateUserName,
  updateUser,
  changePass,
  uploadAvatar,
  getAllUsers,
};
