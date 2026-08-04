import { Router } from "express";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import buildingRoutes from "../modules/buildings/index.js";
import floorRoutes from "../modules/floors/index.js";
import roomRoutes from "../modules/rooms/index.js";
import tenantRoutes from "../modules/tenants/index.js";
import rentEntryRoutes from "../modules/rent/index.js";
import billRoutes from "../modules/bills/index.js";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// Module routes
router.use("/auth", authRoutes);
router.use("/buildings", buildingRoutes);
router.use("/floors", floorRoutes);
router.use("/rooms", roomRoutes);
router.use("/tenants", tenantRoutes);
router.use("/rent", rentEntryRoutes);
router.use("/bills", billRoutes);

export default router;
