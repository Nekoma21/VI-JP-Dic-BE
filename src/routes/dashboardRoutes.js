import express from "express";
import { Auth } from "../middlewares/auth.js";
import {
  getDashboardStats,
  getUserRegistrationChart,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.route("/stats").get(Auth.AdminAuth, getDashboardStats);
router
  .route("/user-registration-chart")
  .get(Auth.AdminAuth, getUserRegistrationChart);

export default router;
