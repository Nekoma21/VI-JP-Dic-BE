import UnauthorizedError from "../errors/UnauthorizedError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const UserAuth = async (req, res, next) => {
  if (!req.headers || !req.headers.authorization) {
    throw new UnauthorizedError("Không có quyền truy cập!");
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn!" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ!" });
    } else {
      next(error);
    }
  }
};

const AdminAuth = async (req, res, next) => {
  if (!req.headers || !req.headers.authorization) {
    throw new UnauthorizedError("Không có quyền truy cập!");
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    console.log(decoded);
    if (decoded.role !== 1) {
      throw new UnauthorizedError("Không có quyền truy cập!");
    }
    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Token đã hết hạn!"));
    } else if (error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Token không hợp lệ!"));
    } else {
      next(error);
    }
  }
};

const ignoreExpirationAuth = (req, res, next) => {
  if (!req.headers || !req.headers.authorization) {
    throw new UnauthorizedError("Không có quyền truy cập!");
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY, {
      ignoreExpiration: true,
    });
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Token đã hết hạn!"));
    } else if (error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Token không hợp lệ!"));
    } else {
      next(error);
    }
  }
};

export const Auth = {
  UserAuth,
  AdminAuth,
  ignoreExpirationAuth,
};
