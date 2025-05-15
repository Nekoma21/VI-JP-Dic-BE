import express from "express";
import { fsrsController } from "../controllers/fsrsController.js";

const fsrsRouter = express.Router();

fsrsRouter.route("/").get(fsrsController.demoFsrs);

export default fsrsRouter;
