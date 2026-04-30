import { createHash } from "node:crypto";
import { db, alertsTable, teamsTable, insightsTable } from "@workspace/db";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";

const LOOKBACK_HOURS = 72;
const MIN_ALERTS_FOR_TEAM = 3;
const TEAMS_PER_RUN = 6;
const INSIGHTS_PER_TEAM_TARGET = 2;

interface RawInsight {
  insight_type: "trend" | "prediction" | "stat" | "matchup";
  title: string;
  body: string;
  confidence: number;
  tags: string[];
}

const SYSTEM_PROMPT = `You are an elite multi-sport beat reporter and analyst (NFL, MLB, NBA).
Given a feed of recent news headlines for a single team, you produce SHORT, HIGH-VALUE insights for sports bettors and fantasy managers.
You write in a confident, terminal-ticker voice — like a Bloomberg analyst, not a fan. Use sport-appropriate terminology (e.g. spread/td-prop for NFL, ERA/closer/HR-prop for MLB, three-point line/PRA for NBA).

Your output format is STRICT JSON: an array of insight objects. Each object has:
- insight_type: one of "trend" (multi-game pattern), "prediction" (forward-looking), "stat" (notable number), "matchup" (vs upcoming opponent)
- title: <= 90 chars, ALL CAPS, no period at end
- body: 1-2 sentences, ~30 words max. State the takeaway and the implication for betting/fantasy. If you reference a number or streak, ground it in something concrete from the headlines.
- confidence: integer 0-100 — how confident you are in the takeaway, given that your only source is the headlines provided
- tags: 1-4 short lowercase tags like ["injury", "qb", "spread", "td-prop", "defense"]

Rules:
- ONLY use information that is reasonably supported by the provided headlines. Do NOT invent stats. If a headline says "scored 5 TDs in 5 games", you can use that. Do NOT make up "10 of last 11 wins" if no headline supports it.
- Lower the confidence if you are extrapolating.
- Skip insights that are obvious or low-value. Quality over quantity. It's OK to return fewer.
- Return at most 3 insights. Return an empty array if nothing is high-value.
- Output JSON ONLY, no prose, no markdown fences.`;

function makeInsightId(teamId: string | null, title: string): string {
  return createHash("sha1")
    .update(`${teamId ?? "league"}::${title}`)
    .digest("hex")
    .slice(0, 24);
}

function safeParseJson(text: string): RawInsight[] {
  let trimmed = text.trim();
  // Remove fenced code blocks if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) trimmed = fenceMatch[1].trim();

  // Find first array bracket
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  const candidate = trimmed.slice(start, end + 1);
  try {
    const parsed = JSON.parse(candidate);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is RawInsight =>
        x &&
        typeof x === "object" &&
        typeof x.title === "string" &&
        typeof x.body === "string" &&
        typeof x.insight_type === "string",
    );
  } catch {
    return [];
  }
}

interface TeamWithAlerts {
  team: typeof teamsTable.$inferSelect;
  alerts: { id: string; headline: string; summary: string | null; publishedAt: Date }[];
}

async function pickTeamsForGeneration(): Promise<TeamWithAlerts[]> {
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);

  // Pick teams with the most recent alert activity that we haven't generated for in the last 6h
  const recentlyGenerated = await db
    .select({
      teamId: insightsTable.teamId,
      latest: sql<Date>`max(${insightsTable.generatedAt})`,
    })
    .from(insightsTable)
    .groupBy(insightsTable.teamId);

  const cooldownMs = 6 * 60 * 60 * 1000;
  const cooldownTeams = new Set(
    recentlyGenerated
      .filter(
        (r) =>
          r.teamId &&
          r.latest &&
          Date.now() - new Date(r.latest).getTime() < cooldownMs,
      )
      .map((r) => r.teamId as string),
  );

  const teamCounts = await db
    .select({
      team: teamsTable,
      cnt: sql<number>`count(${alertsTable.id})::int`,
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
    .orderBy(sql`count(${alertsTable.id}) desc`);

  const picked: TeamWithAlerts[] = [];
  for (const row of teamCounts) {
    if (picked.length >= TEAMS_PER_RUN) break;
    if (row.cnt < MIN_ALERTS_FOR_TEAM) continue;
    if (cooldownTeams.has(row.team.id)) continue;

    const alerts = await db
      .select({
        id: alertsTable.id,
        headline: alertsTable.headline,
        summary: alertsTable.summary,
        publishedAt: alertsTable.publishedAt,
      })
      .from(alertsTable)
      .where(
        and(
          eq(alertsTable.teamId, row.team.id),
          gte(alertsTable.publishedAt, since),
        ),
      )
      .orderBy(desc(alertsTable.publishedAt))
      .limit(15);

    if (alerts.length >= MIN_ALERTS_FOR_TEAM) {
      picked.push({ team: row.team, alerts });
    }
  }
  return picked;
}

async function generateInsightsForTeam(t: TeamWithAlerts): Promise<number> {
  const headlinesBlock = t.alerts
    .map((a, i) => {
      const date = a.publishedAt.toISOString().slice(0, 10);
      const summary = a.summary
        ? ` — ${a.summary.slice(0, 200)}`
        : "";
      return `${i + 1}. [${date}] ${a.headline}${summary}`;
    })
    .join("\n");

  const sportLabel = t.team.sport === "mlb" ? "MLB" : t.team.sport === "nba" ? "NBA" : "NFL";
  const userPrompt = `Sport: ${sportLabel}
Team: ${t.team.city} ${t.team.name} (${t.team.abbreviation})
Conference/Division: ${t.team.conference} ${t.team.division}

Recent headlines (newest first):
${headlinesBlock}

Generate up to ${INSIGHTS_PER_TEAM_TARGET} high-value insights for sports bettors and fantasy managers about this team. Use ${sportLabel}-appropriate terms. JSON only.`;

  let raw: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content[0];
    raw = block && block.type === "text" ? block.text : "";
  } catch (err) {
    logger.warn({ err, teamId: t.team.id }, "Anthropic call failed for team");
    return 0;
  }

  const parsed = safeParseJson(raw);
  if (parsed.length === 0) {
    logger.info({ teamId: t.team.id }, "No usable insights returned for team");
    return 0;
  }

  const rows = parsed.slice(0, 3).map((p) => ({
    id: makeInsightId(t.team.id, p.title),
    teamId: t.team.id,
    insightType: p.insight_type,
    title: p.title.slice(0, 200),
    body: p.body.slice(0, 600),
    confidence: Math.max(0, Math.min(100, Math.round(p.confidence ?? 60))),
    tags: Array.isArray(p.tags) ? p.tags.slice(0, 6).map((s) => String(s).toLowerCase()) : [],
    relatedAlertIds: t.alerts.map((a) => a.id).slice(0, 10),
    generatedAt: new Date(),
  }));

  const inserted = await db
    .insert(insightsTable)
    .values(rows)
    .onConflictDoNothing({ target: insightsTable.id })
    .returning({ id: insightsTable.id });

  return inserted.length;
}

export interface InsightGenerationSummary {
  generated: number;
  startedAt: Date;
  finishedAt: Date;
}

let inProgress: Promise<InsightGenerationSummary> | null = null;

export async function generateInsights(): Promise<InsightGenerationSummary> {
  if (inProgress) return inProgress;
  inProgress = (async () => {
    const startedAt = new Date();
    let generated = 0;
    try {
      const teams = await pickTeamsForGeneration();
      logger.info(
        { candidates: teams.length },
        "Generating insights for teams",
      );
      for (const t of teams) {
        const n = await generateInsightsForTeam(t);
        generated += n;
      }
    } catch (err) {
      logger.error({ err }, "Insight generation failed");
    }
    const finishedAt = new Date();
    logger.info(
      { generated, durationMs: finishedAt.getTime() - startedAt.getTime() },
      "Insight generation complete",
    );
    return { generated, startedAt, finishedAt };
  })();
  try {
    return await inProgress;
  } finally {
    inProgress = null;
  }
}

let pollerStarted = false;

export function startInsightsPoller(): void {
  if (pollerStarted) return;
  pollerStarted = true;
  const intervalMs = 30 * 60 * 1000; // every 30 minutes
  const tick = () => {
    generateInsights().catch((err) =>
      logger.error({ err }, "Insights tick failed"),
    );
  };
  setInterval(tick, intervalMs);
  // First run after the news poller has had time to populate
  setTimeout(tick, 20_000);
}

// Backfill: re-categorize old alerts that were classified with the legacy scheme
const LEGACY_TO_NEW: Record<string, string> = {
  injury: "player_update",
  trade: "player_update",
  suspension: "player_update",
  signing: "player_update",
  lineup: "player_update",
  performance: "player_update",
};

export async function migrateLegacyCategories(): Promise<void> {
  for (const [legacy, next] of Object.entries(LEGACY_TO_NEW)) {
    await db
      .update(alertsTable)
      .set({ category: next })
      .where(eq(alertsTable.category, legacy));
  }
}
