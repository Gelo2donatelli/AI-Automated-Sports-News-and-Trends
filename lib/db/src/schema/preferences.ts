import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const preferencesTable = pgTable("preferences", {
  clientId: text("client_id").primaryKey(),
  followedTeamIds: text("followed_team_ids").array().notNull().default([]),
  categoriesEnabled: text("categories_enabled")
    .array()
    .notNull()
    .default([
      "injury",
      "trade",
      "lineup",
      "performance",
      "signing",
      "suspension",
      "general",
    ]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Preference = typeof preferencesTable.$inferSelect;
export type InsertPreference = typeof preferencesTable.$inferInsert;
