import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";

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

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.status(200).json({ users });
});

router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const targetId = req.params.id;
  const requesterId = req.user!.sub;

  if (targetId === requesterId) {
    res.status(400).json({ error: "Admins cannot revoke their own access." });
    return;
  }

  const [deleted] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, targetId))
    .returning({ id: usersTable.id, email: usersTable.email });

  if (!deleted) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  logger.info({ targetId, deletedEmail: deleted.email, requesterId }, "User revoked by admin");
  res.status(200).json({ message: `Access revoked for ${deleted.email}.`, userId: deleted.id });
});

export default router;
