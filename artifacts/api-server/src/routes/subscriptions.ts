import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/subscriptions/me", requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .orderBy(subscriptionsTable.createdAt)
    .limit(1);

  if (!sub) {
    res.status(404).json({ error: "No subscription found" });
    return;
  }

  res.status(200).json({
    id: sub.id,
    userId: sub.userId,
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
  });
});

router.post("/subscriptions", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { plan } = req.body as { plan?: "free" | "pro" | "enterprise" };

  if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
    res.status(400).json({ error: "Valid plan is required (free, pro, enterprise)" });
    return;
  }

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const existing = await db
    .select({ id: subscriptionsTable.id })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  let sub;
  if (existing.length > 0) {
    [sub] = await db
      .update(subscriptionsTable)
      .set({ plan, status: "active", currentPeriodEnd: periodEnd, updatedAt: new Date() })
      .where(eq(subscriptionsTable.userId, userId))
      .returning();
  } else {
    [sub] = await db
      .insert(subscriptionsTable)
      .values({ userId, plan, status: "active", currentPeriodEnd: periodEnd })
      .returning();
  }

  res.status(201).json({
    id: sub.id,
    userId: sub.userId,
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
  });
});

export default router;
