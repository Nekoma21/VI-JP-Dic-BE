import bcrypt from "bcrypt";
import User from "../models/user.js";
import Token from "../models/token.js";
import sendEmail from "../utils/sendMail.js";
import crypto from "crypto";
import dotenv from "dotenv";
import NotFoundError from "../errors/NotFoundError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import BadRequestError from "../errors/BadRequestError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

dotenv.config();

const signUp = async (data) => {
  const { email, password } = data.body;

  try {
    const emailIsExist = await User.findOne({ email });
    if (emailIsExist) {
      throw new BadRequestError(
        "Email đã tồn tại, vui lòng đăng ký với email khác!"
      );
    }

    const fullname = email.split("@")[0];
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password: hashedPass,
      fullname,
      username: fullname,
      role: 0,
      avatar: process.env.AVATAR_DEFAULT,
    });

    await newUser.save();

    const token = await new Token({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.FE_BASE_URL}user/verify/${newUser._id}/${token.token}`;
    await sendEmail(newUser.email, "Verify Email", url);

    return;
  } catch (error) {
    throw error;
  }
};

const verifyEmail = async (req) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) throw new NotFoundError("Link không hợp lệ: User không tồn tại");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) throw new NotFoundError("Link không hợp lệ hoặc đã hết hạn");

    await User.updateOne(
      { _id: user._id }, // <— filter
      { verified: true } // <— update (Mongoose sẽ tự thêm $set)
    );
    await token.deleteOne();
    const payload = { _id: user._id.toString(), role: user.role };
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    user.refreshToken = refreshToken;
    await user.save();
    const userInfo = await User.findById(user._id).select(
      "email fullname username role avatar"
    );

    return {
      status: StatusCodes.OK,
      data: {
        user: userInfo,
        token: user.generateAuthToken(),
        refreshToken: refreshToken,
      },
      message: "Xác thực tài khoản thành công",
    };
  } catch (error) {
    throw error;
  }
};

const login = async (req) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      throw new UnauthorizedError("Email hoặc mật khẩu không đúng");

    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.FE_BASE_URL}user/verify/${user._id}/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);
      }

      return {
        status: 400,
        message:
          "Một email đã được gửi đến tài khoản của bạn, vui lòng xác thực",
      };
    }
    const payload = { _id: user._id.toString(), role: user.role };
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    user.refreshToken = refreshToken;
    await user.save();
    const userInfo = await User.findById(user._id).select(
      "email fullname username role avatar"
    );
    return {
      status: StatusCodes.OK,
      data: {
        user: userInfo,
        token: user.generateAuthToken(),
        refreshToken: refreshToken,
      },
      message: "Đăng nhập thành công",
    };
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (data) => {
  try {
    const refreshToken = data.body.refreshToken;
    if (!refreshToken) {
      throw new BadRequestError("Không tìm thấy Refresh Token!");
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại!");
    }

    if (refreshToken !== user.refreshToken) {
      throw new BadRequestError("Refresh Token không hợp lệ!");
    }

    return {
      status: StatusCodes.OK,
      data: {
        token: user.generateAuthToken(),
      },
      message: "Đăng nhập thành công",
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token đã hết hạn!");
    } else if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Token không hợp lệ!");
    } else {
      throw error;
    }
  }
};

const forgotPassword = async (req) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("Email không tồn tại trong hệ thống");
  }

  await Token.deleteMany({ userId: user._id });
  const tokenString = crypto.randomBytes(32).toString("hex");
  await new Token({ userId: user._id, token: tokenString }).save();

  const url = `${process.env.FE_BASE_URL}user/verify-mail-reset/${user._id}/${tokenString}`;
  await sendEmail(
    user.email,
    "Reset mật khẩu",
    `Nhấn vào link sau để đặt lại mật khẩu: ${url}`
  );
};

const verifyMailReset = async (req) => {
  const { id, token } = req.params;

  const user = await User.findById(id);
  if (!user) throw new NotFoundError("Link không hợp lệ: User không tồn tại");

  const dbToken = await Token.findOne({ userId: user._id, token });
  if (!dbToken) throw new NotFoundError("Link không hợp lệ hoặc đã hết hạn");

  return;
};

const resetPassword = async (req) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const dbToken = await Token.findOne({ userId: id, token });
  if (!dbToken) {
    throw new NotFoundError("Hết hạn cập nhật mật khẩu hoặc không hợp lệ");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError("User không tồn tại");
  }

  const isSame = await bcrypt.compare(password, user.password);
  if (isSame) {
    throw new BadRequestError("Bạn đang nhập mật khẩu cũ");
  }

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashedPass = await bcrypt.hash(password, salt);

  user.password = hashedPass;
  await user.save();
  await dbToken.deleteOne();
};

export const authService = {
  signUp,
  login,
  verifyEmail,
  refreshToken,
  forgotPassword,
  verifyMailReset,
  resetPassword,
};
