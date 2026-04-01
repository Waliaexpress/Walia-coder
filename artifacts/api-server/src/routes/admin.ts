import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/admin/system", requireAuth, requireAdmin, (_req, res) => {
  res.status(200).json({
    activeUsers: 42,
    serverLoad: "12%",
    dbStatus: "healthy",
    uptime: "99.98%",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

export default router;
