import { StatusCodes } from "http-status-codes";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import dotenv from "dotenv";

dotenv.config();

const getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select("-password -refreshToken ")
      .lean();
    return {
      status: StatusCodes.OK,
      data: user,
      message: "Lấy thông tin user thành công",
    };
  } catch (error) {
    throw error;
  }
};

const changeUsername = async (userId, newUsername) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true }
    ).select("-password -refreshToken");

    return {
      status: StatusCodes.OK,
      message: "Cập nhật username thành công",
      data: user,
    };
  } catch (error) {
    throw error;
  }
};

const updateUserInfo = async (userId, updateData) => {
  try {
    const allowedFields = ["fullname", "birthday", "sex", "level", "demand"];

    const dataToUpdate = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    }

    console.log("data-update: ", dataToUpdate);

    const user = await User.findByIdAndUpdate(userId, dataToUpdate, {
      new: true,
    }).select("-password -refreshToken");

    return {
      status: StatusCodes.OK,
      message: "Cập nhật thông tin người dùng thành công",
      data: user,
    };
  } catch (error) {
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy user");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Mật khẩu nhập vào không khớp");
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPass = await bcrypt.hash(newPassword, salt);
    user.password = hashedPass;
    await user.save();

    return {
      status: StatusCodes.OK,
      message: "Cập nhật mật khẩu thành công",
      data: null,
    };
  } catch (error) {
    throw error;
  }
};

const updateUserAvatar = async (userId, avtPath) => {
  try {
    if (!userId || !avtPath) {
      throw new BadRequestError("Tham số không hợp lệ!");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng!");
    }

    user.avatar = avtPath;
    await user.save();
    return {
      status: StatusCodes.OK,
      message: "Cập nhật ảnh thật công",
      data: user.avatar,
    };
  } catch (error) {
    throw error;
  }
};

const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (local.length <= 3) {
    return local[0] + "*".repeat(local.length - 1) + "@" + domain;
  }
  return local.slice(0, 3) + "*".repeat(local.length - 3) + "@" + domain;
};

const getAllUsers = async (req) => {
  let page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  try {
    if (!page || !limit) {
      const users = await User.find({ role: 0 }).select(
        "fullname username email created_at avatar"
      ); // Chỉ lấy các trường cần thiết

      const data = users.map((user) => ({
        fullname: user.fullname,
        username: user.username,
        email: maskEmail(user.email),
        created_at: user.created_at,
        avatar: user.avatar,
      }));

      return {
        totalPages: 1,
        currentPage: 1,
        data,
      };
    }

    const total = await User.countDocuments({ role: 0 });
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages) page = totalPages;

    const users = await User.find({ role: 0 })
      .select("fullname username email created_at avatar")
      .skip((page - 1) * limit)
      .limit(limit);

    const data = users.map((user) => ({
      fullname: user.fullname,
      username: user.username,
      email: maskEmail(user.email),
      created_at: user.created_at,
      avatar: user.avatar,
    }));

    if (data.length > 0) {
      return {
        totalPages,
        currentPage: page,
        data,
      };
    } else {
      throw new NotFoundError("Không tìm thấy người dùng!");
    }
  } catch (error) {
    throw error;
  }
};

export const userService = {
  getUserInfo,
  changeUsername,
  updateUserInfo,
  changePassword,
  updateUserAvatar,
  getAllUsers,
};
