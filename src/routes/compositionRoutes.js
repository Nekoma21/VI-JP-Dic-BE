import express from "express";
import { compositionController } from "../controllers/compositionController.js";

const compositionRouter = express.Router();

compositionRouter.route("/:id").get(compositionController.getCompositionByID);

export default compositionRouter;
