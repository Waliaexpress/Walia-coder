import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { db, projectsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";

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

  // Insert project FIRST so the UI gets instant feedback
  const [project] = await db
    .insert(projectsTable)
    .values({
      title,
      stack,
      status: "private",
      userId,
    })
    .returning();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Emit the new project immediately - React client can resolve here
  res.write(`data: ${JSON.stringify({ project })}\n\n`);

  let fullContent = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `You are Walia Coder — an elite AI software engineer producing 500% perfect, production-grade code.

When given a project request, you output a complete, runnable implementation with:
- Clean, professional code with clear inline comments
- Modern best practices for the chosen stack
- Complete file structure shown as separate code blocks per file
- Each file preceded by: // FILE: path/to/filename.ext
- No placeholders, no "TODO", no mocked data — real, working code only
- Beautiful UI with dark theme when relevant (bg #0e1117, accent #3b82f6)

Format each file block as:
\`\`\`typescript
// FILE: src/filename.ts
// code here
\`\`\`

End with a "## Project Summary" section listing: files created, dependencies to install, and how to run.`,
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
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    const [project] = await db
      .insert(projectsTable)
      .values({
        title,
        stack,
        status: "private",
        userId,
      })
      .returning({ id: projectsTable.id });

    res.write(`data: ${JSON.stringify({ done: true, projectId: project?.id })}\n\n`);
    res.end();

    logger.info({ userId, title, stack }, "Project generated via AI");
  } catch (err) {
    logger.error(err, "AI generation failed");
    res.write(`data: ${JSON.stringify({ error: "Generation failed. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
