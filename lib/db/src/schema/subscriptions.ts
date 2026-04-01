import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const planEnum = pgEnum("subscription_plan", ["free", "pro", "enterprise"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due"]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
