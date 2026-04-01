import { Router, type IRouter } from "express";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/projects/summary", requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const rows = await db
    .select({
      status: projectsTable.status,
      cnt: count(),
    })
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .groupBy(projectsTable.status);

  const summary = { total: 0, live: 0, building: 0, private: 0 };
  for (const row of rows) {
    const n = Number(row.cnt);
    summary.total += n;
    if (row.status === "live") summary.live = n;
    else if (row.status === "building") summary.building = n;
    else if (row.status === "private") summary.private = n;
  }

  res.status(200).json(summary);
});

router.get("/projects", requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const projects = await db
    .select({
      id: projectsTable.id,
      userId: projectsTable.userId,
      title: projectsTable.title,
      stack: projectsTable.stack,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(desc(projectsTable.createdAt))
    .limit(50);

  res.status(200).json(projects);
});

router.post("/projects", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { title, stack, status } = req.body as {
    title?: string;
    stack?: string;
    status?: "live" | "private" | "building";
  };

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
    .returning({
      id: projectsTable.id,
      userId: projectsTable.userId,
      title: projectsTable.title,
      stack: projectsTable.stack,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    });

  res.status(201).json(project);
});

router.get("/projects/:id", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { id } = req.params;

  const [project] = await db
    .select({
      id: projectsTable.id,
      userId: projectsTable.userId,
      title: projectsTable.title,
      stack: projectsTable.stack,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
    .limit(1);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.status(200).json(project);
});

router.delete("/projects/:id", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { id } = req.params;

  const [deleted] = await db
    .delete(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
    .returning({ id: projectsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.status(200).json({ message: "Project deleted" });
});

export default router;
