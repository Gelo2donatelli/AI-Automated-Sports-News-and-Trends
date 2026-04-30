import { Router, type IRouter } from "express";
import { and, desc, eq, gte, ilike, inArray, sql } from "drizzle-orm";
import { db, alertsTable, teamsTable } from "@workspace/db";
import {
  ListAlertsQueryParams,
  GetAlertParams,
  GetAlertFeedQueryParams,
  GetBreakingAlertsQueryParams,
  GetAlertsByTeamQueryParams,
  GetTrendingTeamsQueryParams,
} from "@workspace/api-zod";
import { refreshAllFeeds } from "../lib/news-fetcher";

const router: IRouter = Router();

type AlertRow = typeof alertsTable.$inferSelect;
type TeamRow = typeof teamsTable.$inferSelect;

function joinAlertWithTeam(alert: AlertRow, team: TeamRow) {
  return {
    id: alert.id,
    teamId: alert.teamId,
    teamName: team.name,
    teamCity: team.city,
    teamAbbreviation: team.abbreviation,
    teamPrimaryColor: team.primaryColor,
    teamSecondaryColor: team.secondaryColor,
    teamLogoUrl: team.logoUrl ?? undefined,
    headline: alert.headline,
    summary: alert.summary ?? undefined,
    category: alert.category,
    priority: alert.priority,
    sourceName: alert.sourceName,
    sourceUrl: alert.sourceUrl,
    publishedAt: alert.publishedAt.toISOString(),
    createdAt: alert.createdAt.toISOString(),
  };
}

router.get("/alerts", async (req, res): Promise<void> => {
  const parsed = ListAlertsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { teamId, category, priority, limit, search } = parsed.data;
  const conditions = [];
  if (teamId) conditions.push(eq(alertsTable.teamId, teamId));
  if (category) conditions.push(eq(alertsTable.category, category));
  if (priority) conditions.push(eq(alertsTable.priority, priority));
  if (search) conditions.push(ilike(alertsTable.headline, `%${search}%`));

  const rows = await db
    .select({ alert: alertsTable, team: teamsTable })
    .from(alertsTable)
    .innerJoin(teamsTable, eq(teamsTable.id, alertsTable.teamId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(alertsTable.publishedAt))
    .limit(Math.min(limit ?? 50, 200));

  res.json(rows.map(({ alert, team }) => joinAlertWithTeam(alert, team)));
});

router.get("/alerts/feed", async (req, res): Promise<void> => {
  const parsed = GetAlertFeedQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { teamIds, limit } = parsed.data;
  const conditions = [];
  if (teamIds && teamIds.trim().length > 0) {
    const ids = teamIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length) conditions.push(inArray(alertsTable.teamId, ids));
  }
  const rows = await db
    .select({ alert: alertsTable, team: teamsTable })
    .from(alertsTable)
    .innerJoin(teamsTable, eq(teamsTable.id, alertsTable.teamId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(alertsTable.publishedAt))
    .limit(Math.min(limit ?? 100, 300));
  res.json(rows.map(({ alert, team }) => joinAlertWithTeam(alert, team)));
});

router.get("/alerts/breaking", async (req, res): Promise<void> => {
  const parsed = GetBreakingAlertsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit } = parsed.data;
  const rows = await db
    .select({ alert: alertsTable, team: teamsTable })
    .from(alertsTable)
    .innerJoin(teamsTable, eq(teamsTable.id, alertsTable.teamId))
    .where(
      sql`${alertsTable.priority} IN ('breaking', 'high')`,
    )
    .orderBy(desc(alertsTable.publishedAt))
    .limit(Math.min(limit ?? 10, 100));
  res.json(rows.map(({ alert, team }) => joinAlertWithTeam(alert, team)));
});

router.get("/alerts/by-team", async (req, res): Promise<void> => {
  const parsed = GetAlertsByTeamQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const limitPerTeam = Math.min(parsed.data.limitPerTeam ?? 5, 20);

  const teams = await db.select().from(teamsTable);
  teams.sort((a, b) => (b.alertCount ?? 0) - (a.alertCount ?? 0));

  const result: { team: ReturnType<typeof teamToResponse>; alerts: ReturnType<typeof joinAlertWithTeam>[] }[] = [];

  // For efficiency, fetch the latest N alerts per team using a window function
  const ranked = await db.execute<{
    id: string;
    team_id: string;
    headline: string;
    summary: string | null;
    category: string;
    priority: string;
    source_name: string;
    source_url: string;
    published_at: Date;
    created_at: Date;
    rn: number;
  }>(sql`
    SELECT * FROM (
      SELECT
        a.*,
        ROW_NUMBER() OVER (PARTITION BY a.team_id ORDER BY a.published_at DESC) AS rn
      FROM alerts a
    ) ranked
    WHERE rn <= ${limitPerTeam}
  `);

  const byTeam = new Map<string, AlertRow[]>();
  for (const row of ranked.rows) {
    const alert: AlertRow = {
      id: row.id,
      teamId: row.team_id,
      headline: row.headline,
      summary: row.summary,
      category: row.category,
      priority: row.priority,
      sourceName: row.source_name,
      sourceUrl: row.source_url,
      publishedAt: new Date(row.published_at),
      createdAt: new Date(row.created_at),
    };
    const list = byTeam.get(alert.teamId) ?? [];
    list.push(alert);
    byTeam.set(alert.teamId, list);
  }

  for (const team of teams) {
    const alerts = byTeam.get(team.id) ?? [];
    result.push({
      team: teamToResponse(team),
      alerts: alerts.map((a) => joinAlertWithTeam(a, team)),
    });
  }
  res.json(result);
});

router.get("/alerts/:alertId", async (req, res): Promise<void> => {
  const parsed = GetAlertParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select({ alert: alertsTable, team: teamsTable })
    .from(alertsTable)
    .innerJoin(teamsTable, eq(teamsTable.id, alertsTable.teamId))
    .where(eq(alertsTable.id, parsed.data.alertId));
  if (!row) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(joinAlertWithTeam(row.alert, row.team));
});

router.post("/alerts/refresh", async (_req, res): Promise<void> => {
  const summary = await refreshAllFeeds();
  res.json({
    teamsRefreshed: summary.teamsRefreshed,
    newAlerts: summary.newAlerts,
    startedAt: summary.startedAt.toISOString(),
    finishedAt: summary.finishedAt.toISOString(),
  });
});

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [{ totalAlerts }] = await db
    .select({ totalAlerts: sql<number>`count(*)::int` })
    .from(alertsTable);

  const [{ alertsLast24h }] = await db
    .select({ alertsLast24h: sql<number>`count(*)::int` })
    .from(alertsTable)
    .where(gte(alertsTable.publishedAt, since));

  const [{ breakingCount }] = await db
    .select({ breakingCount: sql<number>`count(*)::int` })
    .from(alertsTable)
    .where(
      and(
        eq(alertsTable.priority, "breaking"),
        gte(alertsTable.publishedAt, since),
      ),
    );

  const [{ teamsTracked }] = await db
    .select({ teamsTracked: sql<number>`count(*)::int` })
    .from(teamsTable);

  const categoryRows = await db
    .select({
      category: alertsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(alertsTable)
    .groupBy(alertsTable.category);

  const refreshState = await db.execute<{ last_refresh_at: Date | null }>(sql`
    SELECT last_refresh_at FROM refresh_state WHERE id = 'global' LIMIT 1
  `);
  const lastRefreshAt = refreshState.rows[0]?.last_refresh_at
    ? new Date(refreshState.rows[0].last_refresh_at).toISOString()
    : undefined;

  res.json({
    totalAlerts,
    alertsLast24h,
    breakingCount,
    teamsTracked,
    lastRefreshAt,
    categoryCounts: categoryRows.map((r) => ({
      category: r.category,
      count: r.count,
    })),
  });
});

router.get("/stats/trending-teams", async (req, res): Promise<void> => {
  const parsed = GetTrendingTeamsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const limit = Math.min(parsed.data.limit ?? 8, 32);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      team: teamsTable,
      alertsLast24h: sql<number>`count(${alertsTable.id})::int`,
      latestHeadline: sql<string | null>`(
        SELECT a2.headline FROM alerts a2
        WHERE a2.team_id = ${teamsTable.id}
        ORDER BY a2.published_at DESC LIMIT 1
      )`,
    })
    .from(teamsTable)
    .leftJoin(
      alertsTable,
      and(
        eq(alertsTable.teamId, teamsTable.id),
        gte(alertsTable.publishedAt, since),
      ),
    )
    .groupBy(teamsTable.id)
    .orderBy(sql`count(${alertsTable.id}) desc`)
    .limit(limit);

  res.json(
    rows.map((r) => ({
      team: teamToResponse(r.team),
      alertsLast24h: r.alertsLast24h,
      latestHeadline: r.latestHeadline ?? undefined,
    })),
  );
});

function teamToResponse(t: TeamRow) {
  return {
    id: t.id,
    name: t.name,
    city: t.city,
    abbreviation: t.abbreviation,
    conference: t.conference,
    division: t.division,
    primaryColor: t.primaryColor,
    secondaryColor: t.secondaryColor,
    logoUrl: t.logoUrl ?? undefined,
    slug: t.slug,
    alertCount: t.alertCount,
  };
}

export default router;
