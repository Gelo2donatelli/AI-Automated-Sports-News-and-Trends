import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const teamsTable = pgTable("teams", {
  id: text("id").primaryKey(),
  sport: text("sport").notNull().default("nfl"),
  name: text("name").notNull(),
  city: text("city").notNull(),
  abbreviation: text("abbreviation").notNull(),
  conference: text("conference").notNull(),
  division: text("division").notNull(),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  logoUrl: text("logo_url"),
  slug: text("slug").notNull(),
  yardbarkerSlug: text("yardbarker_slug").notNull(),
  alertCount: integer("alert_count").notNull().default(0),
});

export type Team = typeof teamsTable.$inferSelect;
export type InsertTeam = typeof teamsTable.$inferInsert;
