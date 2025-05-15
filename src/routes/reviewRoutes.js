// src/routes/reviewLogRoutes.ts
import express from "express";
import { Auth } from "../middlewares/auth.js";
import { reviewLogController } from "../controllers/reviewLogController.js";

const router = express.Router();

router.route("/").post(Auth.UserAuth, reviewLogController.handleReview);
router
  .route("/preview")
  .post(Auth.UserAuth, reviewLogController.handleReviewPreview);
router
  .route("/statscard")
  .post(Auth.UserAuth, reviewLogController.getTodayCardStats);
router
  .route("/dailynewcard")
  .post(Auth.UserAuth, reviewLogController.getDailyNewCards);
router
  .route("/deckoverview")
  .get(Auth.UserAuth, reviewLogController.getDecksOverview);
router
  .route("/heatmap")
  .post(Auth.UserAuth, reviewLogController.getAllDayStats);
router
  .route("/stats-allcard")
  .get(Auth.UserAuth, reviewLogController.getTodayAllCard);

export default router;
