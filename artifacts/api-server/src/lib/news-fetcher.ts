import { createHash } from "node:crypto";
import { db, alertsTable, teamsTable, refreshStateTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { ALL_TEAMS } from "./teams-data";

const USER_AGENT =
  "Mozilla/5.0 (compatible; PressboxWire/1.0; +https://replit.com)";

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

/**
 * Detect noise / low-value content: media drama, opinion pieces, gossip,
 * social-media clashes, speculative rankings, etc.
 * These should never crowd out actionable sports intelligence.
 */
function isNoise(headline: string, summary?: string): boolean {
  const h = headline.toLowerCase();
  const text = `${h} ${(summary ?? "").toLowerCase()}`;

  // ── Media drama / personality conflicts ────────────────────────────────────
  if (
    /\b(responds?\s+to|react(s|ed|ing)?\s+to|fires?\s+back|claps?\s+back|calls?\s+out|takes?\s+(a\s+)?shot\s+at|slams?\b|blasts?\b|rips?\b|ripping\b|weigh(s|ed|ing)?\s+in\s+on|sound(s|ed|ing)?\s+off|chimes?\s+in|speaks?\s+out\s+against|defends?\s+(himself|herself|themselves|his|her|their)|pushes?\s+back\s+on|takes?\s+(aim|issue)\s+(at|with))\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Debate show clips & talk-show takes ───────────────────────────────────
  if (
    /\b(first\s+take|get\s+up\b|around\s+the\s+horn|pardon\s+the\s+interruption|pti\b|undisputed\b|colin\s+cowherd|skip\s+bayless|shannon\s+sharpe|max\s+kellerman|stephen\s+a\.?\s+smith|debate\s+(show|clip|segment)|talking\s+heads|sports\s+debate|talking\s+about)\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Opinion / ranking / prediction content ─────────────────────────────────
  if (
    /\b(power rankings?|mock draft|report card|hot take[s]?|mailbag|the\s+case\s+(for|against)|why\s+the\s+\w+\s+should|here'?s?\s+why|opinion:|column:|commentary:|fantasy advice|dfs advice|overrated|underrated|most\s+overrated|best\s+and\s+worst|tier\s+list|ranking\s+every|ranking\s+all|ranking\s+the|ranked:|ranking:|who\s+wins\b|who\s+would\s+win|predictions?\s+for|projected?\s+to|my\s+(take|pick|prediction))\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Generic excitement / hype / vague quotes ───────────────────────────────
  if (
    /\b(excited?\s+(about|for|to)|can'?t\s+wait|looking\s+forward\s+to|feels?\s+great|feels?\s+good\s+about|ready\s+to\s+compete|hungry\s+for|driven\s+to|motivated\s+(to|by)|team\s+(is\s+)?(excited|confident|focused|united|hungry)|staying\s+positive|positive\s+vibes|locker\s+room\s+(chemistry|unity|vibe)|blessed\s+to\b|grateful\s+for\b|great\s+atmosphere)\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Rumors without confirmed action (trade interest/talks without deal) ────
  // Allow: "reportedly traded", "reportedly signed", "reportedly injured", "reportedly released"
  // Block: "reportedly interested", "reportedly in talks with" (no action word)
  if (
    /\b(reportedly\s+(interest(ed|s)?|consider(ed|ing|s)?|explored?|could|might|may|target(ed|ing|s)?|in\s+talks?\s+(with|about|over)))\b/.test(
      text,
    ) &&
    !/\b(traded|signed|released|waived|fired|hired|suspended|injured|arrested|extended|acquired|out\s+for|placed\s+on)\b/.test(text)
  ) {
    return true;
  }

  // ── Take-based / clickbait framing ────────────────────────────────────────
  if (
    /\b(is\s+it\s+time\s+to|bold\s+prediction|unpopular\s+opinion|controversial\s+take|the\s+real\s+reason|you\s+won'?t\s+believe|this\s+is\s+why|here'?s?\s+what|what\s+you\s+need\s+to\s+know\s+about|everything\s+you\s+need|fans?\s+(are\s+)?(losing\s+it|going\s+crazy|react(s|ed|ing)?)|twitter\s+react(s|ed|ing)?|social\s+media\s+react(s|ed|ing)?)\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Long-form features / profile pieces / history ─────────────────────────
  if (
    /\b(inside\s+the\s+(story|life|world|rise)|the\s+story\s+of|the\s+(making|rise|fall)\s+of|a\s+look\s+at|looking\s+back\s+at|remember\s+when|on\s+this\s+day|throwback|years?\s+ago\s+today|oral\s+history|the\s+untold\s+story|portrait\s+of|in\s+depth\s+with|exclusive\s+sit[\s-]down|feature:)\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Recap / review without actionable data ────────────────────────────────
  // Allow recaps mentioning injuries, scores, roster moves — block pure narrative recaps
  if (
    /\b(what\s+we\s+learned|takeaways?\s+from|lessons?\s+from|stock\s+(up|down)|winners?\s+and\s+losers?|grades?\s+for|gave\s+(it|them|him|her)\s+(an?\s+)?(a|b|c|d|f)\b|draft\s+(grades?|recap|review|analysis)|season\s+in\s+review|year\s+in\s+review|offseason\s+(grade|review|report\s+card))\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Social-media & gossip hooks ────────────────────────────────────────────
  if (
    /\b(tweets?|instagram\s+post|tiktok|social media\s+(post|backlash|reaction)|goes?\s+viral|viral\s+moment|beef\s+with|feud\s+(between|with)|drama\s+(between|over)|disparag|diss\b|name[- ]calling|clapping\s+back)\b/.test(
      text,
    )
  ) {
    return true;
  }

  // ── Media personality-centric commentary ──────────────────────────────────
  if (
    /\b(disparaging\s+comment|critical\s+comment|insults?\s+(from|by)|responded?\s+to\s+(criticism|comments?|claims?|report|dig|jab|shot|accusation))\b/.test(
      text,
    )
  ) {
    return true;
  }

  return false;
}

function categorize(headline: string, summary?: string): string {
  const text = `${headline} ${summary ?? ""}`.toLowerCase();

  // ── Coaching changes: hires, fires, extensions, coordinator moves ──────────
  if (
    /\b(fired\s+as\s+(head\s+)?coach|hired\s+as\s+(head\s+)?coach|named\s+(head\s+)?coach|named\s+(interim|new)\s+(head\s+)?coach|coaching\s+(change|search|staff|hire|fire)|head\s+coach(ing)?\b|offensive\s+coordinator|defensive\s+coordinator|special\s+teams\s+coordinator|assistant\s+coach|pitching\s+coach|hitting\s+coach|bench\s+coach|manager\s+(hired|fired|named|resigned?|let\s+go)|skipper\s+(fired|hired|resigns?)|front\s+office\s+(move|change)|general\s+manager\s+(fired|hired|named|resigns?))\b/.test(
      text,
    )
  ) {
    return "coaching_update";
  }

  // ── Injury / availability reports ────────────────────────────────────────
  if (
    /\b(injur(ed|y|ies)|ruled\s+out|questionable\b|doubtful\b|out\s+indefinitely|out\s+for\s+(the\s+)?(season|year|game|series)|day[- ]to[- ]day|week[- ]to[- ]week|placed\s+on\s+(ir|the\s+il|disabled\s+list)|designated\s+for\s+(return|assignment)\s+from\s+ir|torn\b|tear\b|sprain(ed)?|fractur|concussion|surgery|procedure|operated?\s+on|achilles|hamstring|acl\b|mcl\b|meniscus|knee\b.*\b(injur|surg|procedure)|ankle\s+injur|shoulder\s+injur|elbow\s+injur|back\s+injur|sidelined|did\s+not\s+(practice|play|dress)|dnp\b|non[- ]contact\s+jersey|limited\s+practice|full\s+practice|returned\s+to\s+practice|missed\s+(practice|game|start)|pes\s+list|covid\s+list|day\s+to\s+day|game[- ]time\s+decision|gtd\b|won'?t\s+play|will\s+not\s+play|inactive\s+list|designated\s+survivor)\b/.test(
      text,
    )
  ) {
    return "injury_report";
  }

  // ── Transactions: trades, signings, releases, waives, extensions ─────────
  if (
    /\b(traded?\b|trading\b|traded\s+to|acquired?\b|acquire[ds]?\b|signed?\s+(a?\s*)?(deal|contract|extension|with|to\b)|re[- ]signs?|re[- ]signed|signing\s+(with|a\s+deal|a\s+contract)|signs\s+(with|to|a)\b|free\s+agent\s+signing|free\s+agent\s+deal|contract\s+(extension|deal|restructure[d]?|renegotiat)|extension\b.*\byears?\b|multi[- ]year\s+(deal|contract|extension)|released?\b|waived?\b|cut\s+(by|from)\b|designated\s+for\s+assignment|dfa\b|claimed?\s+off\s+waivers?|waiver\s+(claim|wire)|buyout|opted?\s+out|player\s+option\s+(declined|exercised|picked\s+up)|qualifying\s+offer|tender\s+(offered?|received?|declined?)|non[- ]tendered?)\b/.test(
      text,
    )
  ) {
    return "transaction";
  }

  // ── Disciplinary / legal / league actions ────────────────────────────────
  if (
    /\b(suspended\b|suspension\b|suspended\s+(for|without|indefinitely)|fined\s+\$|arrested\b|charged\b|convicted\b|banned\s+(from|for|indefinitely)|reinstated\b|appeal(ed|ing|s)?\s+(suspension|ban|fine)|league[- ]issued\s+(suspension|fine|ban)|placed\s+on\s+(commissioner'?s?\s+)?exempt|disciplinary\s+(action|hearing|matter))\b/.test(
      text,
    )
  ) {
    return "disciplinary";
  }

  // ── Starting lineup / depth-chart changes ────────────────────────────────
  if (
    /\b(named\s+(the\s+)?(starting|opening|day\s+1)\s+(quarterback|qb|pitcher|starter|center|goalie|goalkeeper)|named\s+starter\b|will\s+start\b.*\b(game\s+1|opener|sunday|monday|tonight)|starting\s+(lineup|rotation|qb|pitcher|goalie|center)|opening\s+(day\s+starter|day\s+lineup|start)|moved\s+(to|into)\s+the\s+starting|inserted\s+into\s+the\s+(lineup|rotation)|benched\b|demoted\s+(to|from)\b|promoted\s+(to|from)\b|depth\s+chart\s+(change|update|move|shuffle)|inactive[s]?\s+(list|for\s+week)|scratch(ed)?\s+(from\s+the\s+lineup|for\s+(tonight|sunday|game))|removed\s+from\s+(the\s+)?lineup|placed\s+on\s+waivers)\b/.test(
      text,
    )
  ) {
    return "lineup_update";
  }

  // ── Final scores / game results / upsets / overtime ──────────────────────
  if (
    /\b(final[:\s]|final\s+score|defeats?\b|defeated\b|beats?\b|beat\b.*\b\d+[–-]\d+|wins?\b.*\b(game\s+\d|series|matchup|tonight)|loses?\b|loss\b.*\b(clinch|elimin|advance)|overtime\b|ot\b\s*win|double\s+overtime|triple\s+overtime|walk[- ]off\b|buzzer[- ]beater\b|no[- ]hitter\b|perfect\s+game\b|shutout\b.*\b(win|victory)|clinch(ed|es|ing)?\b|eliminat(ed|es|ing)\b|advance[ds]?\s+to\b|series\s+(lead|tied|over)|upset\b.*\b(win|victory|defeat))\b/.test(
      text,
    )
  ) {
    return "game_result";
  }

  // ── Player performance / stats (lower value but still informational) ──────
  if (
    /\b(touchdown|td\b|yards?\b|rushing\s+yards|passing\s+yards|receiving\s+yards|sack\b|interception\b|home\s+run|hr\b|grand\s+slam|rbi\b|strikeout|saves?\b|era\b|batting\s+average|slugging|on[- ]base|stolen\s+base|three[- ]pointer|3[- ]pointer|triple[- ]double|double[- ]double|points?\s+per\s+game|rebound|assist\b|blocks?\b|steals?\b|plus[- ]minus|career[- ]high|career\s+best)\b/.test(
      text,
    )
  ) {
    return "player_update";
  }

  // ── Team-level: standings, cap, draft, franchise news ────────────────────
  if (
    /\b(standings?\b|wild\s*card|playoff\s+(race|picture|berth|seed)|cap\s+space|salary\s+cap|luxury\s+tax|trade\s+deadline|roster\s+(move|cut|decision|deadline)|draft\s+(pick|selection|class|prospect)|minor\s+league|farm\s+system|franchise\s+(tag|player|move|record)|rebuild|tanking|ownership\s+(sale|change)|stadium\s+(deal|move|news))\b/.test(
      text,
    )
  ) {
    return "team_update";
  }

  return "general";
}

function prioritize(category: string, headline: string, summary?: string): string {
  // Check for low-value noise FIRST — no amount of keywords rescues gossip
  if (isNoise(headline, summary)) return "low";

  const text = headline.toLowerCase();

  // ── True breaking: confirmed season-enders, major moves, legal events ─────
  if (
    /\b(breaking[:\s]|just\s+in[:\s]|alert[:\s]|out\s+for\s+(the\s+)?(season|year)|season[- ]ending|torn\s+(acl|mcl|achilles)|placed\s+on\s+ir\b|traded\s+to\b|signs?\s+(with|a\s+\$|a\s+max)|re[- ]signs?\s+(to|for)\b|waived\b|released\b|fired\b.*\b(coach|manager|coordinator|gm)|hired\b.*\b(coach|manager|coordinator|gm)|arrested\b|suspended\s+indefinitely|suspended\s+(without\s+pay|for\s+\d+)|banned\s+(indefinitely|for\s+life)|contract\s+extension\s+(signed?|finalized?|agreed?))\b/.test(
      text,
    )
  ) {
    return "breaking";
  }

  // ── High-value: all actionable categories + key status keywords ───────────
  if (
    category === "injury_report" ||
    category === "transaction" ||
    category === "disciplinary" ||
    category === "coaching_update" ||
    category === "lineup_update" ||
    category === "game_result" ||
    /\b(questionable\b|doubtful\b|ruled\s+out|game[- ]time\s+decision|gtd\b|inactive\b|active\s+list|named\s+starter|won'?t\s+play|will\s+not\s+play|did\s+not\s+practice|limited\s+practice|day[- ]to[- ]day|week[- ]to[- ]week|suspended\b|fined\s+\$|benched\b|demoted\b|promoted\b|depth\s+chart|contract\s+extension|multi[- ]year\s+deal|walk[- ]off|buzzer[- ]beater|overtime|no[- ]hitter|perfect\s+game|clinch|eliminat|playoff\s+berth|upset)\b/.test(
      text,
    )
  ) {
    return "high";
  }

  // ── Player/stat updates — useful but not urgent ───────────────────────────
  if (category === "player_update") {
    return "normal";
  }

  // ── General / team updates — standard feed content ────────────────────────
  return "normal";
}

// ---------------------------------------------------------------------------
// Importance scoring — numeric 1-10 for filtering/ranking
// ---------------------------------------------------------------------------

const KEYWORD_SCORES: { pattern: RegExp; score: number }[] = [
  // Score 10 — hardest stops / bans / season-enders
  { pattern: /\b(breaking|alert|just in)\b/i, score: 10 },
  { pattern: /\b(suspended indefinitely|arrested|banned for life|lifetime ban|criminally charged)\b/i, score: 10 },
  { pattern: /\b(fired|dismissed|terminated)\b/i, score: 10 },
  { pattern: /\b(out for season|season[- ]ending|torn acl|torn mcl|torn achilles|placed on ir)\b/i, score: 10 },

  // Score 9 — major transaction / game-changing events
  { pattern: /\b(traded|trade\s+deadline|acquired|signed\s+(a\s+)?(max|multi[- ]year)|re[- ]signed\s+(to|for))\b/i, score: 9 },
  { pattern: /\b(ruled out|will not play|won'?t play|did not dress)\b/i, score: 9 },
  { pattern: /\b(overtime|ot\b|final score|final:?\s*\d|walk[- ]off|buzzer[- ]beater|no[- ]hitter|perfect game)\b/i, score: 9 },
  { pattern: /\b(hired|named head coach|named manager|new head coach)\b/i, score: 9 },
  { pattern: /\b(suspended\s+\d+|suspended for)\b/i, score: 9 },

  // Score 8 — high-value status / roster moves
  { pattern: /\b(questionable|doubtful|game[- ]time decision|day[- ]to[- ]day)\b/i, score: 8 },
  { pattern: /\b(injured|injury)\b/i, score: 8 },
  { pattern: /\b(inactive|active\s+list|designated\s+for\s+assignment|dfa\b|waived|released|cut\s+(by|from))\b/i, score: 8 },
  { pattern: /\b(acquired|extension|contract\s+(extension|deal)|multi[- ]year\s+deal)\b/i, score: 8 },
  { pattern: /\b(signed|signing)\b/i, score: 8 },

  // Score 7 — notable depth-chart / lineup shifts
  { pattern: /\b(starting|named\s+starter|starter|lineup\s+change|depth\s+chart)\b/i, score: 7 },
  { pattern: /\b(benched|demoted|promoted|moved\s+to\s+(ir|dl|il|bullpen|rotation))\b/i, score: 7 },
  { pattern: /\b(trade\s+rumors?|trade\s+talks?|trade\s+interest)\b/i, score: 7 },
];

// Base scores driven by existing category/priority classifications
const PRIORITY_BASE: Record<string, number> = {
  breaking: 9,
  high: 7,
  normal: 4,
  low: 1,
};

const CATEGORY_BONUS: Record<string, number> = {
  disciplinary: 2,
  injury_report: 1,
  transaction: 1,
  coaching_update: 1,
  lineup_update: 1,
  game_result: 1,
};

function scoreAlert(
  priority: string,
  category: string,
  headline: string,
  summary?: string,
): number {
  // Noise is unconditionally pinned low — keywords can't rescue gossip/opinions
  if (priority === "low") return 1;

  const text = `${headline} ${summary ?? ""}`;

  let maxKeyword = 0;
  for (const { pattern, score } of KEYWORD_SCORES) {
    if (pattern.test(text)) {
      maxKeyword = Math.max(maxKeyword, score);
      if (maxKeyword === 10) break;
    }
  }

  const base = PRIORITY_BASE[priority] ?? 4;
  const bonus = CATEGORY_BONUS[category] ?? 0;
  const fromPriority = Math.min(10, base + bonus);

  return Math.min(10, Math.max(maxKeyword, fromPriority));
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
  feedUrlOverride?: string,
): Promise<ParsedItem[]> {
  const url = feedUrlOverride ?? `https://www.yardbarker.com/rss/team/${yardbarkerSlug}`;
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
  feedUrlOverride?: string,
): Promise<number> {
  const items = await fetchTeamFeed(yardbarkerSlug, feedUrlOverride);
  if (items.length === 0) return 0;

  const rows = items.map((item) => {
    const headline = item.title;
    const summary = item.description;
    const category = categorize(headline, summary);
    const priority = prioritize(category, headline, summary);
    const importanceScore = scoreAlert(priority, category, headline, summary);
    return {
      id: makeAlertId(item.link),
      teamId,
      headline,
      summary: summary ?? null,
      category,
      priority,
      importanceScore,
      sourceName: item.source ?? "Yardbarker",
      sourceUrl: item.link,
      publishedAt: parsePubDate(item.pubDate),
    };
  });

  const result = await db
    .insert(alertsTable)
    .values(rows)
    .onConflictDoUpdate({
      target: alertsTable.sourceUrl,
      // Re-score on re-fetch so improved logic takes effect immediately
      set: {
        category: sql`excluded.category`,
        priority: sql`excluded.priority`,
        importanceScore: sql`excluded.importance_score`,
      },
    })
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

    const concurrency = 8;
    let cursor = 0;
    const queue = ALL_TEAMS.slice();

    async function worker() {
      while (cursor < queue.length) {
        const idx = cursor++;
        const team = queue[idx];
        try {
          const inserted = await fetchAndStoreForTeam(
            team.id,
            team.yardbarkerSlug,
            team.feedUrlOverride,
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
  const rows = ALL_TEAMS.map((t) => ({
    id: t.id,
    sport: t.sport,
    name: t.name,
    city: t.city,
    abbreviation: t.abbreviation,
    conference: t.conference,
    division: t.division,
    primaryColor: t.primaryColor,
    secondaryColor: t.secondaryColor,
    slug: t.slug,
    yardbarkerSlug: t.yardbarkerSlug,
  }));
  await db
    .insert(teamsTable)
    .values(rows)
    .onConflictDoUpdate({
      target: teamsTable.id,
      set: {
        sport: sql`excluded.sport`,
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
  logger.info(
    {
      total: rows.length,
      nfl: rows.filter((r) => r.sport === "nfl").length,
      mlb: rows.filter((r) => r.sport === "mlb").length,
      nba: rows.filter((r) => r.sport === "nba").length,
      nhl: rows.filter((r) => r.sport === "nhl").length,
      ncaaf: rows.filter((r) => r.sport === "ncaaf").length,
      ncaab: rows.filter((r) => r.sport === "ncaab").length,
      golf: rows.filter((r) => r.sport === "golf").length,
    },
    "Seeded teams and sources",
  );
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
