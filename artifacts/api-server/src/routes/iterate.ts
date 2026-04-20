import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { db, projectsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { eq, and } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const router: IRouter = Router();

router.get("/projects/:id/code", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { id } = req.params;

  const [project] = await db
    .select({ generatedCode: projectsTable.generatedCode, status: projectsTable.status })
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({ code: project.generatedCode ?? "", status: project.status });
});

router.post("/projects/:id/iterate", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const { id } = req.params;
  const { prompt, currentCode } = req.body as { prompt?: string; currentCode?: string };

  if (!prompt?.trim()) {
    res.status(400).json({ error: "Prompt is required." });
    return;
  }

  const [project] = await db
    .select({ id: projectsTable.id, title: projectsTable.title })
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const safeWrite = (data: string) => {
    try { res.write(data); } catch { /* client disconnected */ }
  };

  let fullContent = "";
  let clientConnected = true;
  res.on("close", () => { clientConnected = false; });

  const existingCode = currentCode?.trim() || "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8000,
      messages: [
        {
          role: "system",
          content: `You are Walia Coder — an AI that MODIFIES existing web pages based on user instructions.

You will receive an EXISTING HTML file and a change request. Your job is to apply the requested changes and return the COMPLETE updated HTML file.

ABSOLUTE RULES:
1. Output ONLY the full, complete <!DOCTYPE html> document with ALL changes applied. No commentary, no code fences, no explanation.
2. Keep all existing content and structure UNLESS the user explicitly asks to remove or change something.
3. Preserve the Tailwind CDN script tag. Use only static HTML + Tailwind CSS via CDN. No React/Vue/Svelte.
4. Vanilla JS is allowed (under 50 lines) for small interactivity.
5. ALL visible content must be in static HTML — page must look correct with JS disabled.
6. Start with "<!DOCTYPE html>" and end with "</html>". NOTHING ELSE.
7. Keep total output under 7000 tokens to avoid truncation.`,
        },
        {
          role: "user",
          content: existingCode
            ? `Here is the current HTML:\n\n${existingCode}\n\n---\n\nApply this change: ${prompt.trim()}`
            : prompt.trim(),
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

    let html = fullContent.trim();
    const fenceMatch = html.match(/```(?:html)?\n?([\s\S]*?)```/);
    if (fenceMatch) html = fenceMatch[1].trim();
    if (!html.toLowerCase().startsWith("<!doctype")) {
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#0e1117] text-white p-8">${html}</body></html>`;
    }

    await db
      .update(projectsTable)
      .set({ generatedCode: html, status: "live", updatedAt: new Date() })
      .where(eq(projectsTable.id, project.id));

    safeWrite(`data: ${JSON.stringify({ done: true })}\n\n`);
    logger.info({ userId, projectId: project.id, prompt }, "Project iterated");
  } catch (err) {
    logger.error(err, "Iteration failed");
    safeWrite(`data: ${JSON.stringify({ error: "Iteration failed. Please try again." })}\n\n`);
  } finally {
    try { res.end(); } catch { /* already closed */ }
  }
});

export default router;
