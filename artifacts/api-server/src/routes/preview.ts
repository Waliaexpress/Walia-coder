import { Router, type IRouter } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Public — no auth required so iframes can embed without Authorization headers
router.get("/api/projects/:id/preview", async (req, res) => {
  const { id } = req.params;

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  if (!project) {
    res.status(404).send("<!DOCTYPE html><html><body style='background:#0e1117;color:#fff;font-family:monospace;padding:2rem'><h2>404 — Project not found</h2></body></html>");
    return;
  }

  if (!project.generatedCode) {
    // Project exists but not yet generated — show a loading screen that auto-refreshes
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="3">
  <title>Generating…</title>
  <style>
    body { background: #0e1117; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .spinner { width: 40px; height: 40px; border: 3px solid #1c2333; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { margin-top: 1.5rem; font-size: 1rem; color: #64748b; }
  </style>
</head>
<body>
  <div style="text-align:center">
    <div class="spinner"></div>
    <h2>Walia Coder is building your app…</h2>
    <p style="color:#334155;font-size:.75rem">This page refreshes automatically.</p>
  </div>
</body>
</html>`);
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.send(project.generatedCode);
});

export default router;
