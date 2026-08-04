import express from "express";
import {
  getBills,
  addBill,
  updateBill,
  deleteBill,
  getLastBill,
} from "../controllers/bill.controller.js";
import { protect } from "../../auth/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getBills);
router.get("/last", protect, getLastBill);
router.post("/", protect, addBill);
router.put("/:id", protect, updateBill);
router.delete("/:id", protect, deleteBill);

export default router;
