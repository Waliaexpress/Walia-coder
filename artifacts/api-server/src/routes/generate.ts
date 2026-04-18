import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { db, projectsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router: IRouter = Router();

function inferProjectMeta(prompt: string): { title: string; stack: string } {
  const lower = prompt.toLowerCase();
  const stacks: string[] = [];

  if (lower.includes("react") || lower.includes("vite") || lower.includes("frontend") || lower.includes("website") || lower.includes("ui"))
    stacks.push("React • Vite");
  if (lower.includes("express") || lower.includes("api") || lower.includes("backend") || lower.includes("rest"))
    stacks.push("Express");
  if (lower.includes("postgres") || lower.includes("database") || lower.includes("sql") || lower.includes("drizzle"))
    stacks.push("PostgreSQL");
  if (lower.includes("tailwind") || lower.includes("css"))
    stacks.push("Tailwind CSS");
  if (lower.includes("typescript") || lower.includes("ts"))
    stacks.push("TypeScript");
  if (lower.includes("jwt") || lower.includes("auth") || lower.includes("login"))
    stacks.push("JWT Auth");
  if (lower.includes("mobile") || lower.includes("expo") || lower.includes("react native"))
    stacks.push("React Native • Expo");
  if (lower.includes("stripe") || lower.includes("payment") || lower.includes("billing"))
    stacks.push("Stripe");
  if (lower.includes("dashboard") || lower.includes("analytics") || lower.includes("chart"))
    stacks.push("Recharts");
  if (lower.includes("rbac") || lower.includes("role") || lower.includes("permission"))
    stacks.push("RBAC");

  const defaultStack = stacks.length > 0 ? stacks.slice(0, 4).join(" • ") : "Full-Stack • TypeScript";

  const words = prompt.trim().split(/\s+/);
  const rawTitle = words.slice(0, 6).join(" ");
  const title = rawTitle.length > 3
    ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)
    : "Generated Project";

  return { title, stack: defaultStack };
}

router.post("/generate", requireAuth, async (req, res) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({ error: "Prompt is required." });
    return;
  }

  const userId = req.user!.sub;
  const { title, stack } = inferProjectMeta(prompt);

  // Insert project immediately — client gets instant card feedback
  const [project] = await db
    .insert(projectsTable)
    .values({ title, stack, status: "building", userId })
    .returning();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Emit project metadata first so the client can optimistically add the card
  const safeWrite = (data: string) => {
    try { res.write(data); } catch { /* client disconnected, continue anyway */ }
  };

  safeWrite(`data: ${JSON.stringify({ project })}\n\n`);

  let fullContent = "";
  let clientConnected = true;
  res.on("close", () => { clientConnected = false; });

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `You are Walia Coder — an elite AI that generates complete, self-contained, runnable web applications as a SINGLE HTML file.

CRITICAL RULES:
- Output ONLY a single complete <!DOCTYPE html> document. Nothing else.
- No markdown. No explanation. No code fences. Just the raw HTML file.
- The HTML file must be 100% self-contained: all CSS inline, all JS inline, no external dependencies except CDN links.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Use a dark theme by default (background #0e1117, accent #3b82f6, text white).
- Include real, functional UI — no lorem ipsum, no placeholder content.
- If the request mentions a specific framework (React, Vue) use the CDN version via unpkg.
- The result must render beautifully and be fully interactive when opened in a browser.`,
        },
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        if (clientConnected) {
          safeWrite(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
    }

    // Extract the HTML — strip any accidental markdown code fences
    let html = fullContent.trim();
    const fenceMatch = html.match(/```(?:html)?\n?([\s\S]*?)```/);
    if (fenceMatch) html = fenceMatch[1].trim();
    if (!html.toLowerCase().startsWith("<!doctype")) {
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#0e1117] text-white p-8">${html}</body></html>`;
    }

    // Persist the generated HTML and mark project as live
    await db
      .update(projectsTable)
      .set({ generatedCode: html, status: "live", updatedAt: new Date() })
      .where(eq(projectsTable.id, project.id));

    safeWrite(`data: ${JSON.stringify({ done: true, projectId: project.id })}\n\n`);

    logger.info({ userId, title, stack, projectId: project.id }, "Project generated");
  } catch (err) {
    logger.error(err, "AI generation failed");
    // Mark project as private on failure
    await db
      .update(projectsTable)
      .set({ status: "private", updatedAt: new Date() })
      .where(eq(projectsTable.id, project.id))
      .catch(() => {});
    safeWrite(`data: ${JSON.stringify({ error: "Generation failed. Please try again." })}\n\n`);
  } finally {
    try { res.end(); } catch { /* already closed */ }
  }
});

export default router;
