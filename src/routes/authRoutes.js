import express from "express";
import { authController } from "../controllers/authController.js";
import { authValidation } from "../validations/authValidation.js";

const router = express.Router();

router.route("/sign-up").post(authValidation.auth, authController.signUp);
router.route("/login").post(authValidation.auth, authController.login);
router.route("/verify/:id/:token/").get(authController.verifyEmail);

export default router;
