import express from "express";
import { protect } from "../../auth/middleware/auth.middleware.js";
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getRooms);
router.post("/", addRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

export default router;
