import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const alertsTable = pgTable(
  "alerts",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id").notNull(),
    headline: text("headline").notNull(),
    summary: text("summary"),
    category: text("category").notNull().default("general"),
    priority: text("priority").notNull().default("normal"),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sourceUrlUnique: uniqueIndex("alerts_source_url_unique").on(
      table.sourceUrl,
    ),
    teamIdx: index("alerts_team_idx").on(table.teamId),
    publishedIdx: index("alerts_published_idx").on(table.publishedAt),
  }),
);

export type Alert = typeof alertsTable.$inferSelect;
export type InsertAlert = typeof alertsTable.$inferInsert;
