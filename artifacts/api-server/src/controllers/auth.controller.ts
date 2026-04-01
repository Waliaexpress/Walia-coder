import { type Request, type Response } from "express";
import { hashPassword, verifyPassword, signToken } from "../services/auth.service.js";
import { logger } from "../lib/logger.js";

const inMemoryUsers: Array<{ id: string; email: string; passwordHash: string }> = [];

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const existing = inMemoryUsers.find((u) => u.email === email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  inMemoryUsers.push({ id, email, passwordHash });

  const token = signToken({ sub: id, email });

  logger.info({ email }, "User registered");
  res.status(201).json({ token, user: { id, email } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = inMemoryUsers.find((u) => u.email === email);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ sub: user.id, email: user.email });

  logger.info({ email }, "User logged in");
  res.status(200).json({ token, user: { id: user.id, email: user.email } });
}
