import dotenv from "dotenv";
dotenv.config();

import { connectDB, sequelize } from "./src/config/db.js";

console.log("🔥 SERVER STARTED");

const startServer = async () => {
  try {
    // 1. Connect to database first
    await connectDB();

    // 2. Import app and models *after* the database is successfully connected
    const { default: app } = await import("./app.js");
    await import("./src/modules/auth/models/User.js");

    // ⚠️ Only sync in development
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err);
  }
};

startServer();
