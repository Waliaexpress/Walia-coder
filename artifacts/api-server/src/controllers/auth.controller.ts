import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { hashPassword, verifyPassword, signToken } from "../services/auth.service.js";
import { logger } from "../lib/logger.js";

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: "employee" | "manager" | "admin";
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      password: hashedPassword,
      role: role ?? "employee",
    })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      role: usersTable.role,
    });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  logger.info({ email, role: user.role }, "User registered");
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  logger.info({ email, role: user.role }, "User logged in");
  res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
}
