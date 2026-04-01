import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const projectStatusEnum = pgEnum("project_status", ["live", "private", "building"]);

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  stack: text("stack").notNull().default(""),
  status: projectStatusEnum("status").notNull().default("private"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
