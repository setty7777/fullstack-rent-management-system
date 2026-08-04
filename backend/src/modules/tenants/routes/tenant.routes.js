import express from "express";
import multer from "multer";
import { protect } from "../../auth/middleware/auth.middleware.js";
import {
  getTenants,
  addTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/tenant.controller.js";

const router = express.Router();

router.use(protect);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.get("/", getTenants);
router.post("/", upload.array("documents", 5), addTenant);
router.put("/:id", upload.array("documents", 5), updateTenant);
router.delete("/:id", deleteTenant);

export default router;
