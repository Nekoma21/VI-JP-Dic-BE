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
    if (!user) throw new NotFoundError("Invalid link: User not found");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) throw new NotFoundError("Invalid link: User not found");

    await User.updateOne({ _id: user._id, verified: true });
    await token.deleteOne();

    const userInfo = await User.findById(user._id).select(
      "email fullname username role avatar"
    );

    return {
      status: StatusCodes.OK,
      data: {
        user: userInfo,
        token: user.generateAuthToken(),
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
        const url = `${process.env.BASE_URL}user/verify/${user._id}/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);
      }

      return {
        status: 400,
        message:
          "Một email đã được gửi đến tài khoản của bạn, vui lòng xác thực",
      };
    }
    const userInfo = await User.findById(user._id).select(
      "email fullname username role avatar"
    );
    return {
      status: StatusCodes.OK,
      data: {
        user: userInfo,
        token: user.generateAuthToken(),
      },
      message: "Đăng nhập thành công",
    };
  } catch (error) {
    throw error;
  }
};

export const authService = {
  signUp,
  login,
  verifyEmail,
};
