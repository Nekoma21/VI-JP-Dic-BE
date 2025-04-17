import express from "express";
import { translateController } from "../controllers/translateController.js";
import upload from "../middlewares/upload.js";

const translateRouter = express.Router();

translateRouter
  .route("/detect")
  .post(upload.single("file"), translateController.detectText);
translateRouter.route("/").post(translateController.translate);

export default translateRouter;
