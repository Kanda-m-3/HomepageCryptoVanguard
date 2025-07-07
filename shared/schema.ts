import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"), // active, canceled, past_due, etc.
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),
  isServerMember: boolean("is_server_member").default(false),
  isVipMember: boolean("is_vip_member").default(false),
});

export const analyticalReports = pgTable("analytical_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  fileUrl: text("file_url").notNull(),
  isFreeSample: boolean("is_free_sample").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  reportId: integer("report_id").references(() => analyticalReports.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertDiscordUserSchema = createInsertSchema(users).pick({
  discordId: true,
  discordUsername: true,
  discordAvatar: true,
  email: true,
  isServerMember: true,
  isVipMember: true,
});

export const insertAnalyticalReportSchema = createInsertSchema(analyticalReports).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchasedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDiscordUser = z.infer<typeof insertDiscordUserSchema>;
export type User = typeof users.$inferSelect;
export type AnalyticalReport = typeof analyticalReports.$inferSelect;
export type InsertAnalyticalReport = z.infer<typeof insertAnalyticalReportSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
