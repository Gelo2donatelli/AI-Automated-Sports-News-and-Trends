import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const refreshStateTable = pgTable("refresh_state", {
  id: text("id").primaryKey(),
  lastRefreshAt: timestamp("last_refresh_at", { withTimezone: true }),
});

export type RefreshState = typeof refreshStateTable.$inferSelect;
