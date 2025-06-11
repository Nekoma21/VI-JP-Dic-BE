import express from "express";
import { authController } from "../controllers/authController.js";
import { authValidation } from "../validations/authValidation.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

router.route("/sign-up").post(authValidation.auth, authController.signUp);
router.route("/login").post(authValidation.auth, authController.login);
router.route("/verify/:id/:token/").get(authController.verifyEmail);
router
  .route("/refresh")
  .post(Auth.ignoreExpirationAuth, authController.refreshToken);

router.route("/forgot-password").post(authController.forgotPassword);

router
  .route("/verify-mail-reset/:id/:token")
  .get(authController.verifyMailReset);

router.route("/reset-password/:id/:token").post(authController.resetPassword);

export default router;
