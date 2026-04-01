import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/projects", requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const projects = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      stack: projectsTable.stack,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(desc(projectsTable.createdAt))
    .limit(12);

  res.status(200).json({ projects });
});

router.post("/projects", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { title, stack, status } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    res.status(400).json({ error: "Title is required." });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      userId,
      title: title.trim(),
      stack: stack ?? "",
      status: status ?? "private",
    })
    .returning();

  res.status(201).json({ project });
});

export default router;
