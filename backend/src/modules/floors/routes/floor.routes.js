import express from "express";
import { protect } from "../../auth/middleware/auth.middleware.js";
import {
  getFloors,
  addFloor,
  updateFloor,
  deleteFloor,
  getFloorsByBuilding,
} from "../controllers/floor.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getFloors);
router.get("/building/:buildingId", getFloorsByBuilding);
router.post("/", addFloor);
router.put("/:id", updateFloor);
router.delete("/:id", deleteFloor);

export default router;
