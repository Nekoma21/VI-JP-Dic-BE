import express from "express";
import { Auth } from "../middlewares/auth.js";
import { userController } from "../controllers/userController.js";
import upload from "../config/cloudinary.js";

const userRouter = express.Router();

userRouter.route("/").get(Auth.UserAuth, userController.getUser);
userRouter.route("/").put(Auth.UserAuth, userController.updateUser);
userRouter
  .route("/username")
  .patch(Auth.UserAuth, userController.updateUserName);
userRouter.route("/password").patch(Auth.UserAuth, userController.changePass);
userRouter
  .route("/upload")
  .patch(Auth.UserAuth, upload.single("avatar"), userController.uploadAvatar);

userRouter.route("/list").get(Auth.AdminAuth, userController.getAllUsers);

export default userRouter;
