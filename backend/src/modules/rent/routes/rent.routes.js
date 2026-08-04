import express from "express";
import {
  getRentEntries,
  createRentEntry,
  updateRentEntry,
  deleteRentEntry,
} from "../controllers/rent.controller.js";
import { protect } from "../../auth/middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getRentEntries);
router.post("/", createRentEntry);
router.put("/:id", updateRentEntry);
router.delete("/:id", deleteRentEntry);

export default router;
