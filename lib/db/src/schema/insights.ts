import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const insightsTable = pgTable(
  "insights",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id"),
    insightType: text("insight_type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    confidence: integer("confidence").notNull().default(70),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    relatedAlertIds: jsonb("related_alert_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    teamIdx: index("insights_team_idx").on(table.teamId),
    generatedIdx: index("insights_generated_idx").on(table.generatedAt),
  }),
);

export type Insight = typeof insightsTable.$inferSelect;
export type InsertInsight = typeof insightsTable.$inferInsert;
