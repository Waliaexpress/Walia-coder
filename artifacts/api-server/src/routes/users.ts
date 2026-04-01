import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/users/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.sub))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const normalizedRole = user.role === "employee" ? "user" : user.role;
  res.status(200).json({
    id: user.id,
    email: user.email,
    role: normalizedRole,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
