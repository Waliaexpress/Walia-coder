import { Router, type IRouter } from "express";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const router: IRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATUS_FILE = resolve(__dirname, "../../../.github-sync-status");
const HISTORY_FILE = resolve(__dirname, "../../../.github-sync-history.jsonl");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

router.get("/github-sync-status", async (_req, res) => {
  try {
    const raw = await readFile(STATUS_FILE, "utf8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      res.json({ status: "unknown", reason: "No sync has run yet" });
    } else {
      res.json({ status: "error", reason: "Failed to read sync status file" });
    }
  }
});

router.get("/github-sync-history", async (req, res) => {
  const rawLimit = parseInt((req.query.limit as string) ?? "", 10);
  const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT);

  try {
    const raw = await readFile(HISTORY_FILE, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const entries = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const recent = entries.slice(-limit).reverse();
    res.json({ entries: recent, total: entries.length });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      res.json({ entries: [], total: 0 });
    } else {
      res.status(500).json({ error: "Failed to read sync history" });
    }
  }
});

export default router;
