import { createHash } from "node:crypto";
import { db, alertsTable, teamsTable, refreshStateTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { NFL_TEAMS } from "./teams-data";

const USER_AGENT =
  "Mozilla/5.0 (compatible; GridironAlerts/1.0; +https://replit.com)";

interface ParsedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  source?: string;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));
}

function stripCdata(input: string): string {
  return input.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function stripHtml(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(item: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = item.match(re);
  if (!m) return undefined;
  return decodeEntities(stripCdata(m[1].trim()));
}

function parseRss(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRegex) ?? [];
  for (const raw of matches) {
    const title = extractTag(raw, "title");
    const link = extractTag(raw, "link");
    if (!title || !link) continue;
    const description = extractTag(raw, "description");
    const pubDate = extractTag(raw, "pubDate");
    const sourceRaw = extractTag(raw, "dc:creator") ?? extractTag(raw, "source");
    items.push({
      title: stripHtml(title),
      link: link.trim(),
      description: description ? stripHtml(description).slice(0, 600) : undefined,
      pubDate,
      source: sourceRaw ? stripHtml(sourceRaw) : undefined,
    });
  }
  return items;
}

function categorize(headline: string, summary?: string): string {
  const text = `${headline} ${summary ?? ""}`.toLowerCase();
  if (
    /\b(injur|injured|hurt|out for season|tear|torn|sprain|concussion|knee|hamstring|ankle|shoulder|surgery|ir |placed on ir|reserve\/injured|questionable|doubtful|ruled out|sidelined|limited|did not practice|dnp)\b/.test(
      text,
    )
  ) {
    return "injury";
  }
  if (
    /\b(trade|traded|trading|deal sends|acquired|acquire|swap)\b/.test(text)
  ) {
    return "trade";
  }
  if (
    /\b(suspension|suspended|fine|fined|investigat|arrest|charged|legal trouble|domestic)\b/.test(
      text,
    )
  ) {
    return "suspension";
  }
  if (
    /\b(sign|signed|signs|contract|extension|deal worth|free agent|agreed to terms|re-signed|resigned)\b/.test(
      text,
    )
  ) {
    return "signing";
  }
  if (
    /\b(starter|starting|benched|demoted|promoted|active|inactive|depth chart|qb1|rb1|wr1|backup|starts at|start the|named starter)\b/.test(
      text,
    )
  ) {
    return "lineup";
  }
  if (
    /\b(touchdown|yards|rushed for|passed for|catches|reception|interception|sack|career-high|stat|td|points|fantasy|prop|over\/under|spread|odds)\b/.test(
      text,
    )
  ) {
    return "performance";
  }
  return "general";
}

function prioritize(category: string, headline: string): string {
  const text = headline.toLowerCase();
  if (
    /\b(breaking|alert|just in|trade|traded|out for season|torn acl|suspended|arrest|placed on ir|ir designated|will miss|ruled out|fired|hired)\b/.test(
      text,
    )
  ) {
    return "breaking";
  }
  if (
    category === "injury" ||
    category === "trade" ||
    category === "suspension" ||
    /\b(start|named|won't play|wont play|inactive|active|game-time decision|questionable|doubtful)\b/.test(
      text,
    )
  ) {
    return "high";
  }
  return "normal";
}

function makeAlertId(sourceUrl: string): string {
  return createHash("sha1").update(sourceUrl).digest("hex").slice(0, 24);
}

function parsePubDate(input?: string): Date {
  if (!input) return new Date();
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

async function fetchTeamFeed(
  yardbarkerSlug: string,
): Promise<ParsedItem[]> {
  const url = `https://www.yardbarker.com/rss/team/${yardbarkerSlug}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      logger.warn(
        { yardbarkerSlug, status: res.status },
        "Team feed responded with non-200",
      );
      return [];
    }
    const xml = await res.text();
    return parseRss(xml);
  } catch (err) {
    logger.warn({ err, yardbarkerSlug }, "Team feed fetch failed");
    return [];
  }
}

async function fetchAndStoreForTeam(
  teamId: string,
  yardbarkerSlug: string,
): Promise<number> {
  const items = await fetchTeamFeed(yardbarkerSlug);
  if (items.length === 0) return 0;

  const rows = items.map((item) => {
    const headline = item.title;
    const summary = item.description;
    const category = categorize(headline, summary);
    const priority = prioritize(category, headline);
    return {
      id: makeAlertId(item.link),
      teamId,
      headline,
      summary: summary ?? null,
      category,
      priority,
      sourceName: item.source ?? "Yardbarker",
      sourceUrl: item.link,
      publishedAt: parsePubDate(item.pubDate),
    };
  });

  const result = await db
    .insert(alertsTable)
    .values(rows)
    .onConflictDoNothing({ target: alertsTable.sourceUrl })
    .returning({ id: alertsTable.id });

  return result.length;
}

export interface RefreshSummary {
  teamsRefreshed: number;
  newAlerts: number;
  startedAt: Date;
  finishedAt: Date;
}

let refreshInProgress: Promise<RefreshSummary> | null = null;

export async function refreshAllFeeds(): Promise<RefreshSummary> {
  if (refreshInProgress) {
    return refreshInProgress;
  }
  refreshInProgress = (async () => {
    const startedAt = new Date();
    let newAlerts = 0;
    let teamsRefreshed = 0;

    const concurrency = 6;
    let cursor = 0;
    const queue = NFL_TEAMS.slice();

    async function worker() {
      while (cursor < queue.length) {
        const idx = cursor++;
        const team = queue[idx];
        try {
          const inserted = await fetchAndStoreForTeam(
            team.id,
            team.yardbarkerSlug,
          );
          newAlerts += inserted;
          teamsRefreshed += 1;
        } catch (err) {
          logger.error(
            { err, teamId: team.id },
            "Failed refreshing team feed",
          );
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, queue.length) }, () =>
        worker(),
      ),
    );

    // Sync alert counts onto teams table
    await db.execute(sql`
      UPDATE teams
      SET alert_count = COALESCE((
        SELECT COUNT(*) FROM alerts WHERE alerts.team_id = teams.id
      ), 0)
    `);

    const finishedAt = new Date();
    await db
      .insert(refreshStateTable)
      .values({ id: "global", lastRefreshAt: finishedAt })
      .onConflictDoUpdate({
        target: refreshStateTable.id,
        set: { lastRefreshAt: finishedAt },
      });

    logger.info(
      { teamsRefreshed, newAlerts, durationMs: finishedAt.getTime() - startedAt.getTime() },
      "Feed refresh complete",
    );
    return { teamsRefreshed, newAlerts, startedAt, finishedAt };
  })();
  try {
    return await refreshInProgress;
  } finally {
    refreshInProgress = null;
  }
}

export async function ensureTeamsSeeded(): Promise<void> {
  const existing = await db.select({ id: teamsTable.id }).from(teamsTable).limit(1);
  if (existing.length > 0) {
    // Make sure all 32 are present (idempotent upsert)
    await db
      .insert(teamsTable)
      .values(
        NFL_TEAMS.map((t) => ({
          id: t.id,
          name: t.name,
          city: t.city,
          abbreviation: t.abbreviation,
          conference: t.conference,
          division: t.division,
          primaryColor: t.primaryColor,
          secondaryColor: t.secondaryColor,
          slug: t.slug,
          yardbarkerSlug: t.yardbarkerSlug,
        })),
      )
      .onConflictDoUpdate({
        target: teamsTable.id,
        set: {
          name: sql`excluded.name`,
          city: sql`excluded.city`,
          abbreviation: sql`excluded.abbreviation`,
          conference: sql`excluded.conference`,
          division: sql`excluded.division`,
          primaryColor: sql`excluded.primary_color`,
          secondaryColor: sql`excluded.secondary_color`,
          slug: sql`excluded.slug`,
          yardbarkerSlug: sql`excluded.yardbarker_slug`,
        },
      });
    return;
  }
  await db.insert(teamsTable).values(
    NFL_TEAMS.map((t) => ({
      id: t.id,
      name: t.name,
      city: t.city,
      abbreviation: t.abbreviation,
      conference: t.conference,
      division: t.division,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      slug: t.slug,
      yardbarkerSlug: t.yardbarkerSlug,
    })),
  );
  logger.info({ teams: NFL_TEAMS.length }, "Seeded NFL teams");
}

let pollerStarted = false;

export function startBackgroundPoller(): void {
  if (pollerStarted) return;
  pollerStarted = true;
  const intervalMs = 5 * 60 * 1000; // 5 minutes
  const tick = () => {
    refreshAllFeeds().catch((err) =>
      logger.error({ err }, "Background refresh tick failed"),
    );
  };
  setInterval(tick, intervalMs);
  // Initial fetch shortly after startup so first request has data
  setTimeout(tick, 2_000);
}
