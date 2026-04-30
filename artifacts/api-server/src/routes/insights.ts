import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, insightsTable, teamsTable } from "@workspace/db";
import { ListInsightsQueryParams } from "@workspace/api-zod";
import { generateInsights } from "../lib/insights-generator";

const router: IRouter = Router();

type InsightRow = typeof insightsTable.$inferSelect;
type TeamRow = typeof teamsTable.$inferSelect;

function toResponse(insight: InsightRow, team: TeamRow | null) {
  return {
    id: insight.id,
    sport: team?.sport,
    teamId: insight.teamId ?? undefined,
    teamName: team?.name,
    teamCity: team?.city,
    teamAbbreviation: team?.abbreviation,
    teamPrimaryColor: team?.primaryColor,
    teamSecondaryColor: team?.secondaryColor,
    insightType: insight.insightType,
    title: insight.title,
    body: insight.body,
    confidence: insight.confidence,
    tags: insight.tags ?? [],
    relatedAlertIds: insight.relatedAlertIds ?? [],
    generatedAt: insight.generatedAt.toISOString(),
  };
}

function sportFromQuery(q: unknown): string | undefined {
  if (typeof q !== "string") return undefined;
  const s = q.toLowerCase();
  return s === "nfl" || s === "mlb" || s === "nba" ? s : undefined;
}

router.get("/insights", async (req, res): Promise<void> => {
  const parsed = ListInsightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { teamId, limit } = parsed.data;
  const sport = sportFromQuery(req.query.sport);
  const conditions = [];
  if (teamId) conditions.push(eq(insightsTable.teamId, teamId));
  if (sport) conditions.push(eq(teamsTable.sport, sport));

  const rows = await db
    .select({ insight: insightsTable, team: teamsTable })
    .from(insightsTable)
    .leftJoin(teamsTable, eq(teamsTable.id, insightsTable.teamId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(insightsTable.generatedAt))
    .limit(Math.min(limit ?? 20, 100));

  res.json(rows.map(({ insight, team }) => toResponse(insight, team)));
});

router.post("/insights/generate", async (_req, res): Promise<void> => {
  const result = await generateInsights();
  res.json({
    generated: result.generated,
    startedAt: result.startedAt.toISOString(),
    finishedAt: result.finishedAt.toISOString(),
  });
});

export default router;
