import express from "express";
import { kanjiController } from "../controllers/kanjiController.js";
import { Auth } from "../middlewares/auth.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(Auth.AdminAuth, kanjiController.getAllKanjis);
kanjiRouter.route("/").post(Auth.AdminAuth, kanjiController.addNewKanji);
kanjiRouter.route("/:id").put(Auth.AdminAuth, kanjiController.updateKanji);
kanjiRouter.route("/:id").delete(Auth.AdminAuth, kanjiController.deleteKanji);

export default kanjiRouter;
