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
      max_completion_tokens: 8000,
      messages: [
        {
          role: "system",
          content: `You are Walia Coder — an AI that generates complete, self-contained, runnable web pages as a SINGLE static HTML file.

ABSOLUTE RULES (violating these makes the output blank, which is failure):
1. Output ONLY a single complete <!DOCTYPE html> document. No markdown, no code fences, no commentary, no <think> blocks.
2. Use ONLY static HTML + Tailwind CSS via CDN. Do NOT use React, Vue, Svelte, or any JS framework.
3. Allowed JS: vanilla DOM scripts under 50 lines for small interactivity (toggle menu, smooth scroll). Nothing more.
4. ALL visible content must be in static HTML — never rendered by JavaScript. The page must look complete with JS disabled.
5. The <head> must contain exactly: <script src="https://cdn.tailwindcss.com"></script>
6. Dark theme: body uses class="bg-[#0e1117] text-white" — accent color #3b82f6.
7. Page must include real semantic content (headings, paragraphs, sections, real copy) — NEVER lorem ipsum.
8. Keep total output under 7000 tokens to avoid truncation. Be concise.

START YOUR RESPONSE WITH "<!DOCTYPE html>" AND END WITH "</html>". NOTHING ELSE.`,
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
