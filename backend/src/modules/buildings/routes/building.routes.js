import express from "express";
import { protect } from "../../auth/middleware/auth.middleware.js";
import {
  getBuildings,
  addBuilding,
  deleteBuilding,
  updateBuilding,
} from "../controllers/building.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getBuildings);
router.post("/", addBuilding);
router.put("/:id", updateBuilding);
router.delete("/:id", deleteBuilding);

export default router;
