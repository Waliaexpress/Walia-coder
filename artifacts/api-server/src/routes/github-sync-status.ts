import { Router, type IRouter } from "express";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const router: IRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATUS_FILE = resolve(__dirname, "../../../.github-sync-status");

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

export default router;
