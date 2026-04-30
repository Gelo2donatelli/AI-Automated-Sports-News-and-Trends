import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, teamsTable } from "@workspace/db";
import { GetTeamParams } from "@workspace/api-zod";

const router: IRouter = Router();

function teamToResponse(t: typeof teamsTable.$inferSelect) {
  return {
    id: t.id,
    sport: t.sport,
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

function sportFromQuery(q: unknown): string | undefined {
  if (typeof q !== "string") return undefined;
  const s = q.toLowerCase();
  return s === "nfl" || s === "mlb" || s === "nba" || s === "ncaaf" || s === "golf" ? s : undefined;
}

router.get("/teams", async (req, res): Promise<void> => {
  const sport = sportFromQuery(req.query.sport);
  const rows = sport
    ? await db.select().from(teamsTable).where(eq(teamsTable.sport, sport))
    : await db.select().from(teamsTable);
  rows.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  res.json(rows.map(teamToResponse));
});

router.get("/teams/:teamId", async (req, res): Promise<void> => {
  const parsed = GetTeamParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, parsed.data.teamId));
  if (!row) {
    res.status(404).json({ error: "Team not found" });
    return;
  }
  res.json(teamToResponse(row));
});

export default router;
