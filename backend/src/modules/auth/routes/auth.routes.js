import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  getDashboard,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { AUTH_MESSAGES } from "../constants/auth.constants.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: AUTH_MESSAGES.TOO_MANY_ATTEMPTS,
  },
});

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.get("/dashboard", protect, getDashboard);

export default router;
